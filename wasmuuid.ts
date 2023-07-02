import { readFileSync } from 'node:fs';

// JS loader and tester for the sample.
//
// Eli Bendersky [https://eli.thegreenplace.net]
// This code is in the public domain.

// Dumps a WebAssembly.Memory object's contents starting at `start`, for `len`
// bytes in groups of 16.
export const memdump = (mem: WebAssembly.Memory, start: number, len: number) => {
    // console.log(mem.buffer);
    let view = new Uint8Array(mem.buffer);
    for (let i = 0; i < len; i++) {
        let index = start + i;
        process.stdout.write(`${view[index]!.toString(16).toUpperCase().padStart(2, '0')} `);
        if ((index + 1) % 16 === 0) {
            console.log();
        }
    }
    console.log();
};

export type ExportsMem = {
    memory: WebAssembly.Memory;
    read_mem: (src: number) => number;
    orientate: () => void;
    parseInteger: (pointer: number) => number;
    isDigitCode: (code: number) => number;
    moreThan57: (code: BigInt) => number;
    parseHex: () => BigInt;
    parseHexM: () => BigInt;
    parse16char: (char: BigInt) => BigInt;
    millis: () => BigInt;
    readresults: () => BigInt;
    millis2: () => BigInt;
    millis3: () => BigInt;
    millis10: () => BigInt;
    millis20: () => BigInt;
    millis30: () => BigInt;
    write32: (point: number, num: number) => void;
    write64: (point: number, num: BigInt) => void;
    write32parsed64: (point: number, num: number) => void;
    write32parsed64toglobal: (val: number) => void;
    write32parsed64toglobalShift: (shift: number, val: number) => void;
    read32: (point: number) => number;
    read64: (point: number) => number;
    handle32arr: (...args: number[]) => BigInt;
    // millisnoJSMEM: () => BigInt;
    fillmem: (pointer: number, val: number) => void;
};

const uuid = 'ece33fe4-1682-11ee-be56-0242ac120002';
// const buf = Buffer.from(uuid.replaceAll('-', ''), 'hex');

const order = [15, 16, 17, 9, 10, 11, 12, 0, 1, 2, 3, 4, 5, 6, 7] as const;
const shift = [56, 52, 48, 44, 40, 36, 32, 28, 24, 20, 16, 12, 8, 4, 0] as const;

// function writeString (mem: WebAssembly.Memory,str: string, offset: number) {
//     const strBuf = new TextEncoder().encode(str);
//     const outBuf = new Uint8Array(mem.buffer, offset, strBuf.length);
//     for (let i = 0; i < strBuf.length; i++) {
//       outBuf[i] = strBuf[i]!;
//     }
//   }

export const run = async () => {
    // Load the WASM file and instantiate it.
    const bytes = readFileSync('./src/asm/uuid.wasm');
    let obj = await WebAssembly.instantiate(new Uint8Array(bytes));
    const exp = obj.instance.exports as ExportsMem;

    const bb = Buffer.from(uuid);
    for (let i = 0; i < 18; i++) exp.fillmem(i, bb[i]!);
    // const strBuf = new TextEncoder().encode(uuid);
    // const outBuf = new Uint8Array(exp.memory.buffer, 0, strBuf.length);
    // for (let i = 0; i < 18; i++) {
    //     outBuf[i] = strBuf[i]!;
    // }

    console.log(new Date(Number(exp.millis10())));
    memdump(exp.memory, 0, 128);
    // for (let i = 48; i < 58; i++) console.log(i, exp.parse16char(BigInt(i)));
    // for (const digit of ['a', 'b', 'c', 'd', 'e', 'f']) console.log(digit, exp.parse16char(BigInt(digit.charCodeAt(0))));
    for (let i = 0; i < 18; i++) exp.write32(i * 4, bb[i]!);
    // exp.write32(32, 2147483650);
    memdump(exp.memory, 0, 128);
    for (let i = 0; i < 18; i++) console.log(i * 4, exp.read32(i * 4));

    for (let i = 0; i < 18; i++) exp.write64(i * 8, BigInt(bb[i]!));
    // exp.write32(32, 2147483650);
    memdump(exp.memory, 0, 256);
    for (let i = 0; i < 18; i++) console.log(i * 8, exp.read64(i * 8), bb[i]!, String.fromCharCode(bb[i]!));

    for (let i = 0; i < 18; i++) exp.write32parsed64(i * 8, bb[i]!);
    // exp.write32(32, 2147483650);
    memdump(exp.memory, 0, 256);
    for (let i = 0; i < 18; i++) console.log(i * 8, exp.read64(i * 8), bb[i]!, String.fromCharCode(bb[i]!));

    console.log(new Date(Number(exp.millis20())));

    for (const index of order) exp.write32parsed64toglobal(bb[index]!);
    console.log(exp.readresults());
    console.log(new Date(Number(exp.millis30())));
    console.log(exp.readresults());

    for (let i = 0; i < order.length; i++) exp.write32parsed64toglobalShift(shift[i]!, bb[order[i]!]!);
    console.log(exp.readresults());
    console.log(new Date(Number(exp.millis30())));
    console.log(exp.readresults());

    console.log(...bb);
    const arr: number[] = [];
    bb.slice(0, 18).forEach((val) => arr.push(Number(exp.parse16char(BigInt(val)))));
    console.log(...arr);
    console.log(exp.handle32arr(...bb));
    console.log(new Date(Number(exp.handle32arr(...bb.slice(0, 18)))));
};

run().catch(console.error);
