const buildKeyString = (resultRows) => {
	let keyString = '';
	for(let row in resultRows) {
		keyString += resultRows[row].id;
	}

	return keyString;
}

const buildLoggingStr = (message, payload) => {
	return `${message} : ${payload}`;
}

module.exports = {
    buildKeyString,
	buildLoggingStr
}