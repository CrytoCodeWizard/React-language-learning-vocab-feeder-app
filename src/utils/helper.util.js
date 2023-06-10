const buildKeyString = (resultRows) => {
	let keyString = '';
	for(let row in resultRows) {
		keyString += resultRows[row].id;
	}

	return keyString;
}

const buildLoggingStr = (message, opts) => {
	if(opts) {
		if(opts['payload']) {
			return `${message} : ${opts[payload]}`;
		}
	}
	
	return `${message}`;
}

module.exports = {
    buildKeyString,
	buildLoggingStr
}