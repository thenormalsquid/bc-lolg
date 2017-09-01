'use strict'
const P = require('bluebird');

const node = () => ({
	next: null,
	entry: null
});

const printAllEntries = (source, printer) => {
	// print all entries from a given source
	let list = source;
	while (list) {
		const entry = list.entry;
		entry && printer.print(entry);
		list = list.next;
	}
	printer.done();
};

const logSourceToList = async(logSource) => {
	// converts log source into a linked list
	let head = node(),
		temp = head;
	while (!logSource.drained) {
		let entry = await logSource.popAsync();
		if (entry) {
			temp.entry = entry;
			temp.next = node();
		}
		temp = temp.next;
	}
	return head;
}

const merge = async(logSource, list) => {
	// just return the passed linked list if logsource is empty
	if (logSource.drained) {
		return node();
	}

	if (!list) {
		return await logSourceToList(logSource);
	}

	// if we're not at the first position in the array of sources, 
	// head should be a linked list of log entries
	let head = node(),
		temp = head,
		entry1 = await logSource.popAsync(),
		low = null;
	while (!logSource.drained && list) {
		let entry2 = list.entry;
		if (entry1 && entry2) { // entry1 could be false, hence this condition
			if (entry1.date < entry2.date) {
				low = entry1;
				entry1 = await logSource.popAsync();
			} else {
				low = entry2;
				list = list.next;
			}
			temp.entry = low;
			temp.next = node();
			temp = temp.next;
		} else {
			break;
		}
	}

	if (list.next) {
		temp.next = list;
	}
	if (!logSource.drained) {
		temp.next = await logSourceToList(logSource);
	}
	return head;
}

const asyncSorted = (logSources, printer) => {
	if (!logSources || logSources.length < 1) {
		throw new Error('Need log sources to print logs!');
	}
	P.reduce(logSources, (list, source) => {
		return merge(source, list).then(data => {
			return data;
		});
	}, null).then(data => {
		printAllEntries(data, printer);
	});
}


module.exports = asyncSorted;