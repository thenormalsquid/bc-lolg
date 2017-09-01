'use strict'

const node = () => ({
	next: null,
	entry: null
});
const printMergedSources = (logSources, printer) => {
	if (!logSources || logSources.length < 1) {
		throw new Error('Need log sources to print logs!');
	}
	let list = null;
	logSources.forEach(source => {
		list = merge(source, list);
	});
	printAllEntries(list, printer);
};
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

const logSourceToList = (logSource) => {
	// converts log source into a linked list
	let head = node(),
		temp = head;
	while (!logSource.drained) {
		let entry = logSource.pop();
		if (entry) {
			temp.entry = entry;
			temp.next = node();
		}
		temp = temp.next;
	}
	return head;
}

const merge = (logSource, list) => {
	// just return the passed linked list if logsource is empty
	if (logSource.drained) {
		return node();
	}

	if (!list) {
		return logSourceToList(logSource);
	}

	// if we're not at the first position in the array of sources, 
	// head should be a linked list of log entries
	let head = node(),
		temp = head,
		entry1 = logSource.pop(),
		low = null;
	while (!logSource.drained && list) {
		let entry2 = list.entry;
		if (entry1 && entry2) { // entry1 could be false, hence this condition
			if (entry1.date < entry2.date) {
				low = entry1;
				entry1 = logSource.pop();
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
		temp.next = logSourceToList(logSource);
	}
	return head;
}



// also export helper functions for testing
module.exports = {
	printMergedSources,
	printAllEntries
};