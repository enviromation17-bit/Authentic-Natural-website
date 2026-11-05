<?php
declare(strict_types=1);
require __DIR__ . '/../_private/bootstrap.php';
an_security_headers();
an_session();
$loggedIn = !empty($_SESSION['staff_authenticated']);
$error = '';
$notice = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    an_check_csrf((string)($_POST['csrf'] ?? ''));
    $action = (string)($_POST['action'] ?? '');
    if ($action === 'login') {
        $password = (string)($_POST['password'] ?? '');
        if (password_verify($password, an_config()['admin_password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['staff_authenticated'] = true;
            $_SESSION['logged_in_at'] = time();
            header('Location: /admin/', true, 303);
            exit;
        }
        usleep(300000);
        $error = 'Invalid password.';
    } elseif ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        header('Location: /admin/', true, 303);
        exit;
    } elseif ($loggedIn && $action === 'status') {
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
        $status = (string)($_POST['status'] ?? '');
        if (!$id || !in_array($status, ['new','contacted','qualified','won','lost'], true)) {
            $error = 'Invalid lead or status.';
        } else {
            try {
                $stmt = an_db()->prepare('UPDATE authentic_leads SET status = ? WHERE id = ?');
                $stmt->execute([$status, $id]);
                header('Location: /admin/?saved=1', true, 303);
                exit;
            } catch (Throwable $e) {
                error_log('Lead update failed: ' . $e->getMessage());
                $error = 'Unable to update the lead.';
            }
        }
    }
}
if ($loggedIn && time() - (int)($_SESSION['logged_in_at'] ?? time()) > 8 * 3600) {
    $_SESSION = [];
    session_destroy();
    $loggedIn = false;
}
if (isset($_GET['saved'])) $notice = 'Lead status updated.';
if (!$loggedIn) {
    ?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Authentic Naturals · Staff sign in</title>
    <style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#eff4eb;font:15px system-ui;color:#163f2b}.login{width:min(370px,calc(100vw - 36px));background:#fff;padding:34px;border-radius:20px;box-shadow:0 20px 60px #173f2720}.login h1{font:400 32px Georgia,serif;margin:0 0 10px}.login p{color:#617466}label{display:grid;gap:8px;font-weight:700}input{border:1px solid #cad8cc;border-radius:10px;padding:13px}button{margin-top:20px;padding:13px 19px;background:#194a34;color:#fff;border:0;border-radius:10px;cursor:pointer}.err{color:#a42c26}</style></head><body><form class="login" method="post"><h1>Authentic Naturals</h1><p>Private staff dashboard</p>
    <?php if ($error): ?><p class="err" role="alert"><?=an_e($error)?></p><?php endif; ?>
    <input type="hidden" name="csrf" value="<?=an_e(an_csrf())?>"><input type="hidden" name="action" value="login">
    <label>Staff password<input type="password" name="password" autocomplete="current-password" required autofocus></label><button type="submit">Sign in →</button></form></body></html><?php
    exit;
}
$statusFilter = (string)($_GET['status'] ?? 'all');
if (!in_array($statusFilter, ['all','new','contacted','qualified','won','lost'], true)) $statusFilter = 'all';
$search = trim(mb_substr((string)($_GET['q'] ?? ''), 0, 100));
try {
    $db = an_db();
    $where = [];
    $params = [];
    if ($statusFilter !== 'all') {$where[] = 'status = ?';$params[]=$statusFilter;}
    if ($search !== '') {$where[] = '(name LIKE ? OR phone LIKE ? OR city LIKE ? OR topic LIKE ?)';
        $like = '%' . $search . '%';$params=array_merge($params,[$like,$like,$like,$like]);}
    $filterSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';
    $statement=$db->prepare('SELECT id,name,phone,city,source,topic,notes,status,quantity,payment,created_at FROM authentic_leads'
       . $filterSql . ' ORDER BY created_at DESC,id DESC LIMIT 500');
    $statement->execute($params);
    $leads=$statement->fetchAll();
    $counts=array_fill_keys(['new','contacted','qualified','won','lost'],0);
    foreach ($db->query('SELECT status,COUNT(*) AS total FROM authentic_leads GROUP BY status') as $item) {
        $counts[$item['status']] = (int)$item['total'];
    }
    $total = array_sum($counts);
} catch (Throwable $e) {
    error_log('CRM list: ' . $e->getMessage());
    http_response_code(503);
    exit('Database temporarily unavailable.');
}
if (($_GET['export'] ?? '') === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="authentic-naturals-leads.csv"');
    $out=fopen('php://output','w');
    fputcsv($out,['id','name','phone','city','source','topic','notes','status','quantity','payment','created_at']);
    foreach ($leads as $lead) {
        $row = array_values($lead);
        // Guard spreadsheet formula injection on exported customer-supplied values.
        foreach ($row as &$cell) {
            if (is_string($cell) && preg_match('/^[=+@\-\t\r]/u',$cell)) $cell="'".$cell;
        }
        unset($cell);
        fputcsv($out,$row);
    }
    fclose($out);
    exit;
}
function query_filter(string $status, string $search): string {
    return '/admin/?' . http_build_query(['status'=>$status,'q'=>$search]);
}
?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Authentic Naturals · Leads dashboard</title><style>
:root{--green:#17452f;--muted:#667c69;--bg:#f3f6f0}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:#1b3a2a;font:14px/1.5 system-ui,sans-serif}button,input,select{font:inherit}button{cursor:pointer}.shell{max-width:1420px;margin:auto;padding:26px clamp(14px,3vw,42px)}header{display:flex;align-items:center;justify-content:space-between;gap:15px;border-bottom:1px solid #dce6da;padding:0 0 23px}.brand{font-weight:800;letter-spacing:.11em;font-size:12px}.brand small{display:block;color:#6d8872;font-weight:500;letter-spacing:.13em}.logout{background:none;border:1px solid #c9d7c9;padding:10px;border-radius:10px;color:#345b42}.intro{display:flex;justify-content:space-between;align-items:end;gap:20px;margin:38px 0 25px;flex-wrap:wrap}h1{font:400 clamp(35px,5vw,66px)/1.05 Georgia,serif;margin:8px 0}.intro p{color:var(--muted)}.metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.metric{background:#fff;border-radius:15px;padding:20px;border:1px solid #e4ebe2;min-height:120px}.metric strong{display:block;font:400 38px Georgia,serif;margin-top:12px}.metric span{color:#728678;font-size:12px}.metric:first-child{background:var(--green);color:white}.metric:first-child span{color:#cde0d0}.tools{display:flex;gap:12px;flex-wrap:wrap;margin:28px 0 18px}.tools input,.tools select{background:white;border:1px solid #cdddcf;padding:12px;border-radius:10px}.tools input{flex:1;min-width:210px}.tools button,.tools a{background:var(--green);color:white;border:0;text-decoration:none;border-radius:10px;padding:12px 16px}.table-wrap{overflow-x:auto;background:white;border:1px solid #e0e9de;border-radius:16px}table{width:100%;border-collapse:collapse;min-width:900px}th{text-align:left;background:#eaf1e8;color:#536e58;font-size:11px;text-transform:uppercase;letter-spacing:.06em;padding:15px 12px}td{border-top:1px solid #e8eee7;padding:14px 12px;vertical-align:top;font-size:12px;overflow-wrap:anywhere}td strong{display:block;color:#204934}td small{color:#6f8473}.badge{background:#e2efdd;padding:5px 9px;border-radius:15px;text-transform:capitalize}.status-form{display:flex;gap:6px}.status-form select{min-width:95px;width:100px;border-radius:8px;border:1px solid #c8d7c9;padding:6px}.status-form button{border:0;border-radius:8px;background:#245638;color:white;padding:6px 9px}.alert{padding:12px 15px;border-radius:9px;background:#e2efdd;margin:18px 0}.alert.err{background:#f8e3e1;color:#9b2f2a}.note{margin:20px 0;color:#74877a;font-size:12px}@media(max-width:750px){.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.intro{margin-top:25px}.metric strong{font-size:31px}}@media(max-width:420px){.metrics{gap:8px}.metric{padding:14px}}
</style></head><body><div class="shell">
<header><div class="brand">AUTHENTIC NATURALS<small>PRIVATE LEAD DASHBOARD</small></div><form method="post"><input type="hidden" name="csrf" value="<?=an_e(an_csrf())?>"><input type="hidden" name="action" value="logout"><button class="logout">Log out</button></form></header>
<div class="intro"><div><span>CLIENT ENQUIRIES & ORDERS</span><h1>Lead dashboard.</h1><p>Website submissions, enquiries and customer follow-up stages.</p></div><a href="/" style="color:#235c3e">View store ↗</a></div>
<?php if ($error): ?><p class="alert err" role="alert"><?=an_e($error)?></p><?php endif; ?>
<?php if ($notice): ?><p class="alert" role="status"><?=an_e($notice)?></p><?php endif; ?>
<section class="metrics" aria-label="Lead counts"><div class="metric"><span>All leads</span><strong><?=$total?></strong></div>
<?php foreach ($counts as $status=>$count): ?><div class="metric"><span><?=an_e(ucfirst($status))?></span><strong><?=$count?></strong></div><?php endforeach; ?></section>
<form class="tools" method="get" action="/admin/"><input type="search" name="q" maxlength="100" value="<?=an_e($search)?>" placeholder="Search leads by name, phone, city or topic..." aria-label="Search leads">
<select name="status" aria-label="Filter lead status"><option value="all">All statuses</option>
<?php foreach (array_keys($counts) as $s): ?><option value="<?=an_e($s)?>" <?=$statusFilter===$s?'selected':''?>><?=an_e(ucfirst($s))?></option><?php endforeach; ?></select><button>Filter</button>
<a href="<?=an_e('/admin/?'.http_build_query(['status'=>$statusFilter,'q'=>$search,'export'=>'csv']))?>">Export CSV</a></form>
<div class="table-wrap"><table><thead><tr><th>Customer</th><th>Type</th><th>Message / notes</th><th>Created</th><th>Status</th></tr></thead><tbody>
<?php foreach($leads as $lead): ?><tr>
<td><strong><?=an_e($lead['name'])?></strong><?=an_e($lead['phone'])?><br><small><?=an_e($lead['city'])?></small></td>
<td><strong><?=an_e(ucfirst($lead['source']))?></strong><?=an_e($lead['topic'])?><br><small>Qty: <?=$lead['quantity']?></small></td>
<td><?=nl2br(an_e(mb_substr($lead['notes'],0,420)))?></td>
<td><?=an_e($lead['created_at'])?> UTC</td>
<td><form class="status-form" method="post"><input type="hidden" name="csrf" value="<?=an_e(an_csrf())?>"><input type="hidden" name="action" value="status"><input type="hidden" name="id" value="<?=$lead['id']?>">
<select name="status" aria-label="Lead status"><?php foreach (array_keys($counts) as $s): ?><option value="<?=an_e($s)?>" <?=$lead['status']===$s?'selected':''?>><?=an_e(ucfirst($s))?></option><?php endforeach; ?></select><button>Save</button></form></td>
</tr><?php endforeach; ?>
<?php if(!$leads): ?><tr><td colspan="5" style="text-align:center;padding:45px">No leads match this filter.</td></tr><?php endif; ?>
</tbody></table></div><p class="note">Showing up to 500 newest matching leads. Enquiries are only saved here when the website intake API succeeds. The WhatsApp message still requires the visitor to press Send.</p></div></body></html>
