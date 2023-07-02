import { equal } from 'node:assert';
import { readFileSync } from 'fs';

type Exported = {
    memory: WebAssembly.Memory;
    itoa16: (str: BigInt) => [offset: number, len: number];
    itoa: (str: BigInt) => [offset: number, len: number];
};

(async () => {
    const n = parseInt(process.argv[2] || '42');
    const bytes = readFileSync('./src/itoa16.wasm');

    let obj = await WebAssembly.instantiate(bytes);
    let exp = obj.instance.exports as Exported;

    const itoa16 = (n: number) => {
        let [ptr, len] = exp.itoa16(BigInt(n));
        const buf = new Uint8Array(exp.memory.buffer, ptr, len);
        return new TextDecoder('utf8').decode(buf);
    };
    const itoa = (n: number) => {
        let [ptr, len] = exp.itoa(BigInt(n));
        const buf = new Uint8Array(exp.memory.buffer, ptr, len);
        return new TextDecoder('utf8').decode(buf);
    };
    console.log(`invoking itoa16()`, n);
    console.log('out', itoa16(n));

    console.log(`invoking itoa()`, n);
    console.log('out', itoa(n));

    test16(itoa16);
    test(itoa);
})();

export function test16(itoa16: (str: number) => string) {
    console.log('itoa16');
    for (let i = 0; i <= 1000000; i++) {
        equal(i.toString(16), itoa16(i));
        if (i % 1000 !== 0) continue;
        process.stdout.write('\r\x1b[K');
        process.stdout.write(`${(i * 100) / 1000000} %`);
    }
    console.log();
}

export function test(itoa: (str: number) => string) {
    console.log('itoa');
    for (let i = 0; i <= 1000000; i++) {
        equal(i.toString(10), itoa(i));
        if (i % 1000 !== 0) continue;
        process.stdout.write('\r\x1b[K');
        process.stdout.write(`${(i * 100) / 1000000} %`);
    }
    console.log();
}
