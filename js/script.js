//global variables for submit
let final_text_to_submit = '';
let final__translated_text_to_submit = '';
let final_lang_from = document.querySelector('#languageFrom').value;
let final_lang_to = document.querySelector('#languageTo').value;
let final_tags = [];
let final_type = document.querySelector('#type').value;
let final_input_type = '';
let final_result = '';

// Set the current year
document.getElementById("year").innerHTML = new Date().getFullYear();

//if keys are in local storage, fill them in
if (localStorage.getItem('STM_DeepLAPIKey')) {
    document.querySelector('#DeepLAPI').value = localStorage.getItem('STM_DeepLAPIKey');
} else {
    //show header
    document.querySelector('header').classList.remove('hidden');
}
if (localStorage.getItem('STM_OpenAIAPIKey')) {
    document.querySelector('#GPTAPI').value = localStorage.getItem('STM_OpenAIAPIKey');
} else {
    //show header
    document.querySelector('header').classList.remove('hidden');
}

//show/hide header
document.querySelector('header i').addEventListener('click', function () {
    document.querySelector('header').classList.toggle('hidden');
});

//generate tags
const tags = ['formal', 'friendly', 'short', 'informative', 'angry', 'positive', 'apologetic', 'appreciative', 'urgent', 'persuasive']
tags.forEach(function (tag) {
    let tagEl = document.createElement('div');
    tagEl.classList.add('tag');
    tagEl.id = tag;
    tagEl.innerHTML = `<img src="img/${tag}.webp" alt="${tag}">
    <span>${tag}</span>`
    tagEl.addEventListener('click', function () {
        if (tagEl.classList.contains('selected')) {
            tagEl.classList.remove('selected');
            final_tags = final_tags.filter(function (item) {
                return item !== tagEl.id;
            });
        } else {
            tagEl.classList.add('selected');
            final_tags.push(tagEl.id);
        }
    });
    document.querySelector('#tags_options').appendChild(tagEl);
});

//make flags interactive
document.querySelector('#languageFrom').addEventListener('change', function () {
    document.querySelector('#flagFrom').alt = this.value
    switch (this.value) {
        case 'en-US':
            document.querySelector('#flagFrom').src = 'img/flags/4x3/us.svg';
            break;
        case 'de-DE':
            document.querySelector('#flagFrom').src = 'img/flags/4x3/de.svg';
            break;
        case 'ru-RU':
            document.querySelector('#flagFrom').src = 'img/flags/4x3/ru.svg';
            break;
        default:
            document.querySelector('#flagFrom').src = '';
    }
    updateLangHints()
    final_lang_from = this.value;
});

document.querySelector('#languageTo').addEventListener('change', function () {
    document.querySelector('#flagTo').alt = this.value
    switch (this.value) {
        case 'en-US':
            document.querySelector('#flagTo').src = 'img/flags/4x3/us.svg';
            break;
        case 'de-DE':
            document.querySelector('#flagTo').src = 'img/flags/4x3/de.svg';
            break;
        case 'ru-RU':
            document.querySelector('#flagTo').src = 'img/flags/4x3/ru.svg';
            break;
        default:
            document.querySelector('#flagTo').src = '';
    }
    final_lang_to = this.value;
});

//select type
document.querySelector('#type').addEventListener('change', function () {
    final_type = this.value;
});

//call deepl API function
// const DeepLBaseURL = 'https://api-free.deepl.com/v2/';

const DeepLCheckBtn = document.querySelector('#DeepLCheck');
const DeepLAPIKeyInput = document.querySelector('#DeepLAPI');

//entering the key saves it to local storage
DeepLAPIKeyInput.addEventListener('input', function () {
    localStorage.setItem('STM_DeepLAPIKey', this.value);
});

async function callDeepLAPI(type = "usage") {
    const apiKey = DeepLAPIKeyInput.value;
    const proxyUrl = 'deepLProxy.php';

    if (final_lang_from === final_lang_to && type !== 'usage') {
        //just to be safe
        console.log(final_text_to_submit);
        return
    } else {
        const data = {
            type: type,
            from: final_lang_from.substring(0, 2),
            to: final_lang_to.substring(0, 2), //TODO: english is possible with just en but actually there are en-us and en-gb available, might be important later if API changes
            tags: final_tags,
            text: final_text_to_submit,
            apiKey: apiKey
        };

        // console.log(data);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        const response = await fetch(proxyUrl, options);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const responseData = await response.text();
        console.log(responseData);

        if (type === 'usage') {
            showNotif('DeepL key check', responseData);
        }

        return responseData;
    }
}

//check deepl usage
DeepLCheckBtn.addEventListener('click', function () {
    callDeepLAPI('usage');
});

//chatGPT API
const OpenAICheckBtn = document.querySelector('#GPTCheck');
const OpenAIAPIKeyInput = document.querySelector('#GPTAPI');

//entering the key saves it to local storage
OpenAIAPIKeyInput.addEventListener('input', function () {
    localStorage.setItem('STM_OpenAIAPIKey', this.value);
});

async function callOpenAI(check = 'usage') {
    const apiKey = OpenAIAPIKeyInput.value;
    const proxyUrl = 'openAIProxy.php';

    const data = {
        check: check,
        type: final_type,
        input_type: final_input_type,
        lang: final_lang_to,
        tags: final_tags,
        text: final_text_to_submit,
        apiKey: apiKey
    };

    // console.log(data);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    const response = await fetch(proxyUrl, options);

    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const responseData = await response.text();
    console.log(responseData);

    if (check === 'usage') {
        showNotif('OpenAI key check', responseData);
    }

    return responseData;
}

OpenAICheckBtn.addEventListener('click', function () {
    callOpenAI('usage');
});

//notifications
const notifEl = document.querySelector('#notifications');
const nTitle = document.querySelector('#n-title');
const nMsg = document.querySelector('#n-message');

function showNotif(title, msg) {
    nTitle.textContent = title;
    nMsg.textContent = msg;

    notifEl.classList.remove('hidden');
}

document.querySelector('#n-confirm').addEventListener('click', function () {
    notifEl.classList.add('hidden');
    nTitle.textContent = '';
    nMsg.textContent = '';
})

//results screen
//get used options 
function updateOptionsOverview() {
    const oo1 = document.querySelector('#oo1');
    const oo2 = document.querySelector('#oo2');
    const oo3 = document.querySelector('#oo3');
    const oo4 = document.querySelector('#oo4');

    oo1.textContent = final_type;
    oo2.textContent = `${final_lang_from} to ${final_lang_to}`;
    oo3.innerHTML = `<a href="#">${final_input_type}</a>`;
    oo4.textContent = final_tags.join(', ');

    //add event listener to input type
    oo3.addEventListener('click', function (e) {
        e.preventDefault();
        showNotif(`Used input: ${final_input_type}`, final_text_to_submit);
    })
}

//copy to clipboard btn
const copyBtn = document.querySelector('#copyAll');
const outputTextarea = document.querySelector('#text_output');

copyBtn.addEventListener('click', function () {
    // Select the text field
    outputTextarea.select();
    outputTextarea.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(outputTextarea.value);

    // Alert the copied text in popup
    document.getElementById("copyPopup").classList.toggle("show");

    copyBtn.classList.add('active');

    setTimeout(function () {
        document.getElementById("copyPopup").classList.toggle("show");
        copyBtn.classList.remove('active');
    }, 2000);
})

//opening and closing widgets
const optionsScreen = document.querySelector('#options_screen');
const textBtn = document.querySelector('#text');
const promptBtn = document.querySelector('#prompt');

const textWidget = document.querySelector('#text_input_widget');
const promptWidget = document.querySelector('#prompt_input_widget');

//open widgets
textBtn.addEventListener('click', function () {
    textWidget.classList.remove('hidden');
    promptWidget.classList.add('hidden');
    optionsScreen.classList.add('inactive');
});

promptBtn.addEventListener('click', function () {
    textWidget.classList.add('hidden');
    promptWidget.classList.remove('hidden');
    optionsScreen.classList.add('inactive');
});

//close widgets
[textWidget, promptWidget].forEach(function (widget, index) {
    widget.querySelector('.close-widget').addEventListener('click', function () {
        widget.classList.add('hidden');
        optionsScreen.classList.remove('inactive');
    });

    widget.querySelector('.input_submit').addEventListener('click', function () {
        let txtarea = widget.querySelector('textarea')
        //check the textarea element before submit button
        if (txtarea.value.length > 0) {
            //it is ok - we can use the text to submit later, for now we highlight the respective button to indicate the success
            final_text_to_submit = txtarea.value;
            switch (index) {
                case 0:
                    textBtn.classList.add('selected');
                    promptBtn.classList.remove('selected');
                    final_input_type = 'text';
                    break;
                case 1:
                    promptBtn.classList.add('selected');
                    textBtn.classList.remove('selected');
                    final_input_type = 'prompt';
                    break;
            }
            widget.classList.add('hidden');
            optionsScreen.classList.remove('inactive');
        } else {
            //here we highlight the textarea for few seconds to indicate that ist should not be empty
            txtarea.classList.add('empty');
            typeText(txtarea, 'This field cannot be empty!', 1000)
            setTimeout(function () {
                txtarea.classList.remove('empty');
                txtarea.value = '';
            }, 2000);
        }
    });
});

//text typing animation for value and innerHTML | could also just have 1 function but whatever
function typeText(elem, text, totalTime = 2000) {
    let timePerChar = totalTime / text.length;
    let i = 0;
    let timer = setInterval(function () {
        elem.value += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(timer);
        }
    }, timePerChar);
}

function typeText2(elem, text, totalTime = 2000) {
    let timePerChar = totalTime / text.length;
    let i = 0;
    let timer = setInterval(function () {
        elem.innerHTML += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(timer);
        }
    }, timePerChar);
}

//speech recognition widget
const SR_textEl = document.querySelector('#sr_output');
const SR_langEl = document.querySelector('#languageFrom');
const rec_btn = document.querySelector('#record');
const stop_btn = document.querySelector('#stop');
const recordingTimeEl = document.querySelector('#recording_time');

function updateLangHints() {
    document.querySelectorAll('.sr_selectedLangDisplay').forEach(item => {
        item.textContent = SR_langEl.value;
    })
}

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

//set language
recognition.lang = SR_langEl.value;
updateLangHints()

//recognition starts when user clicks the record button and goes on continuously until user clicks the stop button
recognition.continuous = true;

recognition.interimResults = true;

let timer
let dotPositions = [];

//rec button starts recognition
rec_btn.addEventListener('click', function () {
    rec_btn.classList.add('ongoing');
    //time counter starts form 00:00
    recordingTimeEl.textContent = '00:00';
    //start time
    let startTime = new Date();
    //update time every second
    timer = setInterval(function () {
        let time = new Date(new Date() - startTime);
        let minutes = time.getMinutes().toString().padStart(2, '0');
        let seconds = time.getSeconds().toString().padStart(2, '0');
        recordingTimeEl.textContent = `${minutes}:${seconds}`;
    }, 1000);
    recognition.lang = SR_langEl.value;
    recognition.start();
});

//recognition stops when user presses the stop button
stop_btn.addEventListener('click', function () {
    rec_btn.classList.remove('ongoing');
    //stop time counter
    clearInterval(timer);
    recognition.stop();
    //those positions are the ones where we need to add a dot, but each element in the set must be increased by its index, because we are adding dots in the text and the positions are constantly changing
    let dotPositionsSetWithIndex = [...new Set(dotPositions)].map((item, index) => item + index);

    //we add the dots at the positions we need
    dotPositionsSetWithIndex.forEach((item) => {
        SR_textEl.value = SR_textEl.value.slice(0, item) + '.' + SR_textEl.value.slice(item);
    });
    //if there is no dot at the end of the text we add one
    if (SR_textEl.value[SR_textEl.value.length - 1] !== '.') {
        SR_textEl.value += '.';
    }
    //we reset the dot positions array
    dotPositions = [];
});

//write what user speaks continuously as he speaks until he stops with the button
let pauseTimer;
recognition.addEventListener('result', function (e) {
    // the . (dot) is used to indicate the end of a sentence when user pauses for a while between words

    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => {
        //if there is no dot already we add one
        //when the pause is detected we remember the length of the text and this is the position where we add the dot after the recognition stops.
        dotPositions.push(SR_textEl.value.length);
        console.log('pause detected');
    }, 1000); // set the timer threshold

    let transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

    SR_textEl.value = transcript;
});

//confirm options and proceed to loading screen while the app is waiting for API response
const startBtn = document.querySelector('#start');
const loadingScreen = document.querySelector('#loading_screen');
const resultsScreen = document.querySelector('#results_screen');


startBtn.addEventListener('click', async function () {
    loadingScreen.classList.remove('inactive');
    optionsScreen.classList.add('inactive');
    //TODO: api request comes here and maybe we need some kind of check of user inputs
    //first we check languages to see if we even need the translation
    if (final_lang_from !== final_lang_to) {
        //if we need translation we call deepl api
        final__translated_text_to_submit = await callDeepLAPI('translate');
    } else {
        //if we don't need translation we just submit the original text
        final__translated_text_to_submit = final_text_to_submit;
    }

    //then we call chatgpt api
    final_result = await callOpenAI('chatgpt')

    //then we can close the loading screen and open the results screen
    loadingScreen.classList.add('inactive');
    resultsScreen.classList.remove('inactive');

    //fill the options overview parameters
    updateOptionsOverview()

    //fill the final textarea
    outputTextarea.value = final_result;
});

//back button on results screen
const backBtn = document.querySelector('#goBack');
backBtn.addEventListener('click', function () {
    resultsScreen.classList.add('inactive');
    optionsScreen.classList.remove('inactive');
});

//loading screen has some sentences that are typed in one by one
let loadingTexts = [
    'Did you know that the word "set" has the most definitions in the English language? It has over 430 different meanings!',
    'The longest word in the English language that can be typed using only the left hand is "stewardesses."',
    'The word "oxymoron" is itself an oxymoron, as it combines two words with opposite meanings.',
    'The longest palindrome in the English language is "a man, a plan, a canal, Panama!"',
    'The word "robot" comes from the Czech word "robota," which means "forced labor" or "drudgery."',
    'The first chatbot, ELIZA, was created in 1966 and was designed to simulate a conversation with a psychotherapist.',
    'The longest word in the English language that is a single word, without hyphens or spaces, is "pneumonoultramicroscopicsilicovolcanoconiosis," which is a type of lung disease caused by inhaling fine silica dust.',
    'The longest word in the English language that is a palindrome (spelled the same way forwards and backwards) is "deified."',
    'The first machine translation system was developed in the 1950s by the Georgetown-IBM experiment, which translated Russian sentences into English.',
    'The word "meme" was coined by Richard Dawkins in his 1976 book "The Selfish Gene" to describe an idea or behavior that spreads from person to person within a culture.',
    'The longest word in the English language that is a single syllable is "screeched."',
    'The first speech recognition system was developed in the 1950s by Bell Labs, which could recognize digits spoken by a single voice.',
    'Every prompt you see here is generated by an AI',
];

const loadingTextsBackup = loadingTexts.slice();

const loadingPromptEl = loadingScreen.querySelector('#loadingPrompt')

let prevString = '';

//switch between loading prompts
setInterval(function () {
    loadingPromptEl.innerHTML = '';
    //remove previous string from the array
    loadingTexts.splice(loadingTexts.indexOf(prevString), 1);
    //if array is empty, refill it
    if (loadingTexts.length === 0) {
        loadingTexts = loadingTextsBackup.slice();
    }
    //get a random string from the array
    prevString = loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
    typeText2(loadingPromptEl, prevString, 3000);
}, 8000);