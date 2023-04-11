<?php
require __DIR__ . '/vendor/autoload.php';

use DeepL\Translator;

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$type = $data['type'];
$from = $data['from'];
$to = $data['to'];
$tags = $data['tags'];
$text = $data['text'];
$authKey = $data['apiKey'];

$formality = 1;

//if array contains the string 'formal' then increase the formality score by 1
//if it contains friendly - decrease by 1
if (in_array('formal', $tags)) {
    $formality++;
} else if (in_array('friendly', $tags)) {
    $formality--;
}

$formalityArr = ['prefer_less', 'default', 'prefer_more'];
$formalityOpt = $formalityArr[$formality];

try {
    $translator = new Translator($authKey);

    if ($type == 'usage') {
        $usage = $translator->getUsage();
        if ($usage->anyLimitReached()) {
            echo 'Translation limit exceeded.';
        }
        if ($usage->character) {
            echo 'Characters: ' . $usage->character->count . ' of ' . $usage->character->limit;
        }
        if ($usage->document) {
            echo 'Documents: ' . $usage->document->count . ' of ' . $usage->document->limit;
        }
    } else if ($type == 'translate') {
        $translationResult = $translator->translateText($text, $from, $to, ['formality' => $formalityOpt]);
        echo $translationResult->text;
    }
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
