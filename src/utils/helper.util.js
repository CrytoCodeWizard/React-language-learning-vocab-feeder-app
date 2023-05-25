const buildKeyString = (resultRows) => {
	let keyString = '';
	for(let row in resultRows) {
		keyString += resultRows[row].id;
	}

	return keyString;
}

module.exports = {
    buildKeyString,
}