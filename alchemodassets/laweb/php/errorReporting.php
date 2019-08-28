<?php
require_once 'PHPUserAgent/phpUserAgent.php';
require_once 'PHPUserAgent/phpUserAgentStringParser.php';

if(isset($_POST['data']) && !empty($_POST['data'])) {
    $data = json_decode($_POST['data'], true);
    $data['time'] = date("Y-m-d H:i:s", $data['time'] / 1000);

    $userAgent = new phpUserAgent($data["userAgent"]);
    $data['browser'] = $userAgent->getBrowserName() . " " . $userAgent->getBrowserVersion();
    $data['os'] = $userAgent->getOperatingSystem();

    unset($data['userAgent']);

    try {
        $db = getConnection();

        $sql = "SELECT id FROM `err_reports_2` WHERE `msg`=:msg AND `url`=:url AND `line`=:line AND `col`=:col AND `browser`=:browser AND `os`=:os";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':msg', $data['msg']);
        $stmt->bindParam(':url', $data['url']);
        $stmt->bindParam(':line', $data['line']);
        $stmt->bindParam(':col', $data['col']);
        $stmt->bindParam(':browser', $data['browser']);
        $stmt->bindParam(':os', $data['os']);
        $stmt->execute();
        $id = $stmt->fetch(PDO::FETCH_OBJ);

        if ( $id ) {
            $sql = "UPDATE `err_reports_2` SET `counter` = `counter` + 1, `stack` = :stack, `resolution` = :resolution, `time` = :time WHERE `id` = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':id', $id->id);
            $stmt->bindParam(':stack', $data['stack']);
            $stmt->bindParam(':resolution', $data['resolution']);
            $stmt->bindParam(':time', $data['time']);
            $stmt->execute();
        }
        else {
            $sql = "INSERT INTO `err_reports_2` (`msg`, `url`, `line`, `col`, `stack`, `browser`, `os`, `resolution`, `time`, `counter`) VALUES (:msg, :url, :line, :col, :stack, :browser, :os, :resolution, :time, 1);";
            $stmt = $db->prepare($sql);
            $stmt->execute($data);
        }
    } catch(PDOException $e) {
        echo '{"error":{"text":"mysqlError"}}';
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function getConnection() {
    $dbhost="mysql.l8r.pl";
    $dbuser="la_library";
    $dbpass="kalabangalol99";
    $dbname="littlealchemylib";
    $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}

function getIP() {
    echo $_SERVER['REMOTE_ADDR'];
}

?>