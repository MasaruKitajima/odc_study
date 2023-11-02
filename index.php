<?php
  require_once('./secrets/db.php');
  try {
    $pdo = new PDO("mysql:host=localhost;dbname=ShinKaiYaku", $user, $pw);
    $sql = "SELECT OSIS.BookName AS folderName, SEC.bookNo AS bookNo, BOOK.title AS BookName, chapterNo, sectionNo, commentNo, htmlText FROM BibleSectionData AS SEC JOIN Products.cmn_ISO639_2_CODE_OSIS AS OSIS ON SEC.bookNo=OSIS_id  JOIN BibleBookData AS BOOK ON SEC.bookNo=BOOK.bookNo WHERE Language_id=1 ORDER BY SEC.bookNo, chapterNo, sectionNo;";
    foreach($pdo->query($sql, PDO::FETCH_ASSOC) AS $row) {
      $dirName = './' . $row['folderName'];
      if(!file_exists($dirName)) {
        //mkdir($dirName,0755,true);
      }
      $subDirName = $dirName . '/' . $row['chapterNo'];
      if(!file_exists($subDirName)) {
        //mkdir($subDirName,0755,true);
      }
      $filename= $row['sectionNo'] . '.html';
      $path=$subDirName . '/' . $filename;
      echo $filename . nl2br("<br>");
    }

  } catch (PDOException $e) {
    print $e->getMessage();
    echo "<br><hr>";
    print $e->getTraceAsString();
    echo "<br><hr>";
    $pdo->rollBack();
  }
  $sth = null;
  $pdo = null;
?>