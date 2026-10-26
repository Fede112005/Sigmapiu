<?php
/**
 * Sigma+ — ricezione del modulo contatti (richiede PHP 8.1 o superiore).
 *
 * Riceve la richiesta da Contatti.html, la verifica e la inoltra via SMTP alla casella indicata in config.php.
 * Non salva dati personali su disco e non invia email all'indirizzo scritto nel modulo
 * (così nessuno può usare il sito per spedire messaggi a terzi).
 * Credenziali, configurazione e libreria stanno nella cartella privata, FUORI dalla cartella pubblica.
 */
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

const PRIVATE_DIR = __DIR__ . '/../sigmapiu-privato';   // adattare se la cartella privata è altrove

date_default_timezone_set('Europe/Rome');

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function reply(int $code, array $data): never
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, ['ok' => false]);
}

$cfg = require PRIVATE_DIR . '/config.php';

// 1. Solo richieste partite dalle pagine del sito Sigma+
if (!in_array($_SERVER['HTTP_ORIGIN'] ?? '', $cfg['allowed_origins'], true)) {
    reply(403, ['ok' => false]);
}

// 2. Solo JSON, al massimo 20 kB
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    reply(415, ['ok' => false]);
}
$raw = file_get_contents('php://input', false, null, 0, 20001);
if ($raw === false || strlen($raw) > 20000) {
    reply(413, ['ok' => false]);
}
$in = json_decode($raw, true);
if (!is_array($in)) {
    reply(400, ['ok' => false]);
}

// 3. Anti-spam: campo trappola compilato o modulo inviato in meno di 3 secondi = bot.
//    Si risponde "ok" senza inviare nulla, così il bot non capisce di essere stato fermato.
if (($in['website'] ?? '') !== '' || !is_int($in['t'] ?? null) || $in['t'] < 3000) {
    reply(200, ['ok' => true]);
}

// 4. Limite di invii per indirizzo IP (applicato dopo la validazione). L'IP non viene salvato in chiaro, solo come impronta cifrata,
//    e le impronte più vecchie di un giorno vengono cancellate.
function rate_limited(array $cfg): bool
{
    $dir = PRIVATE_DIR . '/ratelimit';
    if (!is_dir($dir) && !mkdir($dir, 0700) && !is_dir($dir)) {
        return false;
    }
    $now  = time();
    $file = $dir . '/' . hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', $cfg['secret']);
    $fp   = fopen($file, 'c+');
    if ($fp === false) {
        return false;
    }
    flock($fp, LOCK_EX);
    $hits = json_decode((string) stream_get_contents($fp), true) ?: [];
    $hits = array_values(array_filter($hits, fn($t) => is_int($t) && $t > $now - $cfg['rate_window']));
    $blocked = count($hits) >= $cfg['rate_max'];
    if (!$blocked) {
        $hits[] = $now;
    }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($hits));
    flock($fp, LOCK_UN);
    fclose($fp);

    if (random_int(1, 50) === 1) {
        foreach (glob($dir . '/*') ?: [] as $old) {
            if (filemtime($old) < $now - 86400) {
                @unlink($old);
            }
        }
    }
    return $blocked;
}

// 5. Validazione: tipo, lunghezza, UTF-8 valido, niente caratteri di controllo (blocca l'iniezione di intestazioni)
$bad = [];
function text(array $in, string $key, int $max, bool $required, bool $multiline, array &$bad): string
{
    $v = $in[$key] ?? '';
    if (!is_string($v)) {
        $bad[] = $key;
        return '';
    }
    $v    = trim(str_replace("\r", '', $v));
    $ctrl = $multiline ? '/[\x00-\x08\x0B-\x1F\x7F]/' : '/[\x00-\x1F\x7F]/';
    if (($required && $v === '') || strlen($v) > $max || !preg_match('//u', $v) || preg_match($ctrl, $v)) {
        $bad[] = $key;
    }
    return $v;
}
$nome    = text($in, 'nome', 100, true, false, $bad);
$cognome = text($in, 'cognome', 100, true, false, $bad);
$azienda = text($in, 'azienda', 150, true, false, $bad);
$ruolo   = text($in, 'ruolo', 100, false, false, $bad);
$email   = text($in, 'email', 254, true, false, $bad);
$tel     = text($in, 'tel', 30, false, false, $bad);
$dim     = text($in, 'dim', 20, false, false, $bad);
$ambito  = text($in, 'ambito', 20, false, false, $bad);
$msg     = text($in, 'msg', 5000, false, true, $bad);

$dimensioni = ['' => '-', 'fino a 50' => 'Fino a 50 addetti', '50-250' => '50-250 addetti',
               '250+' => 'Oltre 250 addetti', 'PA' => 'Pubblica amministrazione'];

if (filter_var($email, FILTER_VALIDATE_EMAIL) === false)                         $bad[] = 'email';
if ($tel !== '' && !preg_match('/^[0-9 +().\/-]{5,30}$/', $tel))                 $bad[] = 'tel';
if (!array_key_exists($dim, $dimensioni))                                        $bad[] = 'dim';
if (!in_array($ambito, ['', 'Conformità', 'Controllo', 'Strategia', 'Non so ancora'], true)) $bad[] = 'ambito';
if (($in['privacy'] ?? false) !== true)                                          $bad[] = 'privacy';

if ($bad) {
    reply(422, ['ok' => false, 'fields' => array_values(array_unique($bad))]);
}

// Limite di invii: conta solo le richieste valide, così un errore di compilazione non blocca nessuno
if (rate_limited($cfg)) {
    reply(429, ['ok' => false]);
}

// 6. Invio tramite SMTP autenticato, solo testo semplice (nessun HTML proveniente dal modulo)
require PRIVATE_DIR . '/PHPMailer/Exception.php';
require PRIVATE_DIR . '/PHPMailer/PHPMailer.php';
require PRIVATE_DIR . '/PHPMailer/SMTP.php';

$vuoto = fn(string $s): string => $s === '' ? '-' : $s;

$body = "Nuova richiesta dal modulo contatti del sito Sigma+\n\n"
      . 'Nome:        ' . $nome . ' ' . $cognome . "\n"
      . 'Azienda:     ' . $azienda . "\n"
      . 'Ruolo:       ' . $vuoto($ruolo) . "\n"
      . 'Email:       ' . $email . "\n"
      . 'Telefono:    ' . $vuoto($tel) . "\n"
      . 'Dimensione:  ' . $dimensioni[$dim] . "\n"
      . 'Tappa:       ' . $vuoto($ambito) . "\n\n"
      . "Messaggio:\n" . $vuoto($msg) . "\n\n"
      . 'Consenso al trattamento dei dati per ricevere risposta: sì (' . date('d/m/Y H:i') . ")\n";

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = $cfg['smtp_host'];
    $mail->Port       = $cfg['smtp_port'];
    $mail->SMTPSecure = $cfg['smtp_port'] === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->SMTPAuth   = true;
    $mail->Username   = $cfg['smtp_user'];
    $mail->Password   = $cfg['smtp_pass'];
    $mail->CharSet    = PHPMailer::CHARSET_UTF8;
    $mail->XMailer    = ' ';                              // non dichiara software e versione
    $mail->setFrom($cfg['from_email'], 'Sito Sigma+');   // mittente fisso del dominio: passa i controlli SPF/DKIM
    $mail->addAddress($cfg['to_email']);
    $mail->addReplyTo($email, $nome . ' ' . $cognome);   // "Rispondi" va direttamente al richiedente
    $mail->Subject = 'Richiesta dal sito: ' . $azienda;
    $mail->isHTML(false);
    $mail->Body = $body;
    $mail->send();
} catch (Throwable $e) {
    error_log('Sigma+ contatti: invio non riuscito (' . get_class($e) . ')');   // nessun dato personale nel log
    reply(502, ['ok' => false]);
}

reply(200, ['ok' => true]);
