var blacklist = [
  "the", "a", "and", "of", "is", "or", "also", "it", "non", "an"
];

var period_blacklist = ["Ms\\.", "Mrs\\.", "Mr\\.", "e\\.g\\.", "i\\.e\\.",
						 "\\.\\.", "p\\.m\\.", "a\\.\\m.", "P\\.M\\.", "A\\.M\\."];

var tag_blacklist = ["LI", "UL", "OL", "TABLE", 
					"TBODY", "THEAD", "TD", "TR"];


var selection = window.getSelection();
var parent = selection["focusNode"]["parentElement"]["parentElement"];

while (parent.tagName != "DIV") {
	parent = parent.parentNode;
}//while

var tags = parent.children;

var headers = [];
var paragraphs = [];

var totalText = "";
var temp = gatherTextData(parent);
paragraphs = temp[0];
headers = temp[1];

if (tags.length == 0) {
	paragraphs.push(parent.textContent || parent.innerText || "")
}//if

totalText = paragraphs.join("\n");

var overallFreq = generateFrequencyTable(totalText);
var sentences = [];
var scores = [];
var paragraphBreaks = [0];

var count = 0;

for (var i = 0; i < paragraphs.length; i++) {
	var paraScore = scoreText(overallFreq, paragraphs[i]);
	var paraTable = generateFrequencyTable(paragraphs[i]);

	var thisSentences = splitSentences(paragraphs[i]);
	var thisScores = [];

	thisSentences.forEach(function(val, idx) {
		thisScores.push([idx + count, 
			combineSentenceAndParagraphScores(idx, i, scoreText(paraTable, val), 
												scoreText(overallFreq, val), 
												paraScore)]);
	});

	sentences = sentences.concat(thisSentences);
	scores = scores.concat(thisScores);

	count += thisSentences.length;
	paragraphBreaks.push(count);
}//for

if (num_sentences < 1) {
	num_sentences *= sentences.length;
}//if

num_sentences = Math.max(1, num_sentences);

//sort scores in descending order wrt/ sentence scores
scores.sort(function(a,b) {
	return b[1] - a[1];
});
scores = scores.slice(0, num_sentences);

//sort scores in ascending order wrt/ sentence indexes
scores.sort(function(a,b) {
	return a[0] - b[0];
});

var summarized = "";

var prevParIdx = 0;
scores.forEach(function(val, scoreIdx) {
	var idx = val[0];
	var paraIdx = floor(paragraphBreaks, idx);

	if (paraIdx > prevParIdx) {
		if (scoreIdx != 0) {
			summarized += "</p>"
		}//if

		for (var i = 0; i < headers.length; i++) {
			if (paraIdx > headers[i][0] && (i == headers.length - 1 || paraIdx <= headers[i + 1][0])) {
				summarized += "<h2>" + headers[i][1].replace(/(\[.*\])/g, "") + "</h2>";

				headers = headers.slice(i + 1, -1);

				break;
			}//if
		}//for

		summarized += "<p>";
	}//if
	prevParIdx = paraIdx;

	summarized += sentences[idx].trim() + " ";
});

chrome.storage.local.set({"summBot-summarized":summarized, "summBot-title": document.title});
chrome.runtime.sendMessage({
	from:"select-summBot",
	subject:"ShowNotification"
});

//get greatest value in array that is less than or equal to val
function floor(array, val) {
	if (array[0] > val) {
		return -1;
	}//if

	for (var i = 1; i < array.length; i++) {
		if (array[i] > val) {
			return i;
		}//if
	}//for
}//floor

function gatherTextData(parent) {
	var tags = parent.children;

	var paragraphs = [];
	var headers = [];

	var count = 0;
	for (var i = 0; i < tags.length; i++) {
		var tag = tags[i].tagName;
		var text = tags[i].textContent || tags[i].innerText || "";

		if (text.replace(/\W+/g, " ").length > 0) {
			if (tag.length == 2 && tag[0] == "H") {
				headers.push([paragraphs.length, text]);
			} else if (tag == "P") {
				paragraphs.push(text.trim());
			} else if (!tag_blacklist.includes(tag)) {
				var temp = gatherTextData(tags[i]);
				paragraphs = paragraphs.concat(temp[0]);

				temp[1].forEach(function(val,idx) {
					temp[1][idx] = [val[0] + count, val[1]];
				});

				headers = headers.concat(temp[1]);

			}//else

			count = paragraphs.length;
		}//if
	}//for

	return [paragraphs, headers];
}

/*******************************************

			SUMMARIZER FUNCTIONS
	
********************************************/

function combineSentenceAndParagraphScores(idx, paraIdx, sentToParaScore, sentToAllScore, paraToAllScore) {
	var score = sentToParaScore*0.5 + sentToAllScore * 0.5 + paraToAllScore * 0.1;

	if (idx == 0) {
		score += sentToParaScore * 0.5;
	}//if

	if (paraIdx == 0) {
		score += paraToAllScore * 0.5;
	}//if

	return score;
}//combineSentenceAndParagraphScores

function splitSentences(text) {

  period_blacklist.forEach(function(val) {
    text = text.replace(new RegExp(val, "g"), val.replace(/\\\./g,""));
  });
  text = text.replace(/\[[0-9]+\]/g, "");

  var sentences = text.split(/(?<=[\.|!|\?])\s/g);

  if (sentences[sentences.length - 1].trim().length == 0) {
  	return sentences.slice(0,-1);
  } else {
  	return sentences;
  }//else
}//splitSentences

function verifyWord(word) {
	return word.length > 1 && !blacklist.includes(word);
}//verifyWord

function generateFrequencyTable(text) {
	var words = text.toLowerCase().replace(/\W+/g, " ").split(" ");

	var table = {};

	for (var i = 0; i < words.length; i++) {
		if (verifyWord(words[i])) {
			var search = tableContains(table, words[i]);

			if (search) {
				table[search]++;
			} else {
				table[words[i]] = 1;
			}//else
		}//if
	}//for

	return table;
}

function tableContains(table, word) {
	for(var key in table) {
		if (equiv(key, word)) {
			return key;
		}//if
	}//for

	return false;
}

function scoreText(wordTable, text) {
	var words = text.toLowerCase().replace(/\W+/g, " ").split(" ");

	var score = 0;

	for (var i = 0; i < words.length; i++) {
		score += scoreWord(wordTable, words[i]);
	}//for

	score /= Math.pow(text.length, 0.5);

	return score;
}//scoreText

function equiv(word1, word2) {
	return word1.includes(word2) || word2.includes(word1);
}//equiv

function scoreWord(wordTable, word) {

	for(var key in wordTable) {
		if (equiv(key, word)) {
			return wordTable[key];
		}//if
	}//for

	return 0;
}//scoreWord