<?php
require __DIR__ . '/vendor/autoload.php';

use Symfony\Component\HttpClient\Psr18Client;
use Tectalic\OpenAi\Authentication;
use Tectalic\OpenAi\Client;
use Tectalic\OpenAi\Manager;
use Tectalic\OpenAi\Handlers\ChatCompletions;
use Tectalic\OpenAi\ClientException;
use Tectalic\OpenAi\Handlers\Models;

//model to use
$AImodel = 'gpt-3.5-turbo';

//get the post data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$type = $data['type'];
$input_type = $data['input_type'];
$lang = $data['lang'];
$tags = $data['tags'];
$text = $data['text'];
$authKey = $data['apiKey'];
$check = $data['check'];

//create instructions depending on type
$instructions = '';
if ($type == 'email') {
    // $instructions = 'Write an email using the provided text as a reference. Use the same language as the provided text. The result should contain the same information as the provided text, nothing else. You should adjust the style and tone of the text and create a concice email. The email should be ' .  join(', ', $tags) . '. This is the reference text: ';
    $instructions = 'Generate ' . $type . '. Inputs: ' . $input_type . '. Style: ' . join(', ', $tags) . '. Language: ' . $lang . '. Clarity: Concise output. Reference ' . $input_type . ': ';
} else if ($type == 'code') {
    $instructions = 'Generate ' . $type . ' from the following description: ';
} else if ($type == 'poem') {
    $instructions = 'Generate ' . $type . '. Inputs: ' . $input_type . '. Style: ' . join(', ', $tags) . '. Language: ' . $lang . '. Clarity: Concise output, rhyming and rhythmic verse. Reference ' . $input_type . ': ';
} else {
    $instructions = 'Generate ' . $type . '. Inputs: ' . $input_type . '. Style: ' . join(', ', $tags) . '. Language: ' . $lang . '. Clarity: Concise output. Reference ' . $input_type . ': ';
}

// Build a Tectalic OpenAI REST API Client globally.
// $auth = new Authentication(getenv('OPENAI_API_KEY'));
$auth = new Authentication($authKey);
$httpClient = new Psr18Client();
$openaiClient = Manager::build($httpClient, $auth);

if ($check == 'usage') {
    $handler = new Models();

    // Perform a request
    try {
        $model = $handler->retrieve($AImodel)->toModel();
        // Do something with the response model...
        echo ($model->id);
    } catch (ClientException $e) {
        // Error response received. Retrieve the HTTP response code and response body.
        $responseBody = $handler->toArray();
        $responseCode = $handler->getResponse()->getStatusCode();
        // Handle the error...
        echo ($responseBody['error']['message']);
    }
} else {

    $handler = new ChatCompletions();

    // Perform a request
    try {
        $model = $handler->create(
            new \Tectalic\OpenAi\Models\ChatCompletions\CreateRequest([
                'model' => $AImodel,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $instructions . $text,
                    ],
                ],
            ])
        )->toModel();
        // Do something with the response model...
        echo $model->choices[0]->message->content;
    } catch (ClientException $e) {
        // Error response received. Retrieve the HTTP response code and response body.
        $responseBody = $handler->toArray();
        $responseCode = $handler->getResponse()->getStatusCode();
        // Handle the error...
        echo ($responseBody['message']);
    }
}
