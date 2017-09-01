import test from 'ava';
import LogSource from '../lib/log-source';
import Printer from '../lib/printer';
import {
    printMergedSources,
    printAllEntries
} from './sync-sorted-merge';
import sinon from 'sinon';

// setup
let printer = new Printer(),
    source = new LogSource();

test.before(t => {
    sinon.spy(printer, 'print');
});


// teardown
test.after(t => {
    printer.print.restore(); //unwrap the spy
    source.pop.restore();
});

test('should print all entries from a given source', t => {
    // test helper function printAllEntries
    // we've already tested LogSource in log-source.spec
    printAllEntries(source, printer);
    t.true(printer.print.called);
});