import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import * as http$1 from 'node:http';
import http__default$1, { Server as Server$1 } from 'node:http';
import * as node_https from 'node:https';
import node_https__default, { Server } from 'node:https';
import * as node_zlib from 'node:zlib';
import * as node_stream from 'node:stream';
import { PassThrough, Transform } from 'node:stream';
import * as node_buffer from 'node:buffer';
import * as node_util from 'node:util';
import * as node_url from 'node:url';
import { pathToFileURL, fileURLToPath } from 'node:url';
import * as node_net from 'node:net';
import * as node_fs$1 from 'node:fs';
import { promises, existsSync } from 'node:fs';
import * as node_path$1 from 'node:path';
import { dirname as dirname$1, resolve as resolve$1, join } from 'node:path';
import { AsyncLocalStorage } from 'node:async_hooks';
import invariant from 'vinxi/lib/invariant';
import { join as join$1, virtualId, handlerModule } from 'vinxi/lib/path';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { createEnv } from '@t3-oss/env-nextjs';
import { z as z$3 } from 'zod';
import br$1 from 'pg';
import { createFileRoute, lazyRouteComponent, lazyFn, useRouter, defaultParseSearch, isRedirect as isRedirect$1, isNotFound, createRootRoute, Outlet, ScrollRestoration, Link, useRouterState, RouterProvider, createMemoryHistory, ScriptOnce, createRouter as createRouter$2, pick, isPlainArray, isPlainObject as isPlainObject$1, defer as defer$1, createControlledPromise } from '@tanstack/react-router';
import Sr from 'axios';
import * as x$2 from 'react';
import { createElement, createContext as createContext$1 } from 'react';
import A$2 from 'react-dom/server';
import { createPortal } from 'react-dom';

var commonjsGlobal$1 = typeof globalThis !== 'undefined' ? globalThis : "undefined" !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromNamespaceIfNotNamed (n) {
	return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
}

var node$1 = {};

const require$$3 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(http$1);

const require$$4$1 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(node_https);

const require$$5 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(node_zlib);

const require$$6$1 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(node_stream);

const require$$7 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(node_buffer);

const require$$8 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(node_util);

var nodeFetchNative_61758d11 = {};

var l$2=Object.defineProperty;var o=(e,t)=>l$2(e,"name",{value:t,configurable:!0});var commonjsGlobal=typeof globalThis<"u"?globalThis:typeof commonjsGlobal$1<"u"?commonjsGlobal$1:typeof self<"u"?self:{};function getDefaultExportFromCjs(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}o(getDefaultExportFromCjs,"getDefaultExportFromCjs"),nodeFetchNative_61758d11.commonjsGlobal=commonjsGlobal,nodeFetchNative_61758d11.getDefaultExportFromCjs=getDefaultExportFromCjs;

const require$$10 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(node_url);

const require$$11 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(node_net);

const require$$0$1 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(node_fs$1);

const require$$1$1 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(node_path$1);

var ms$1=Object.defineProperty;var u$1=(c,l)=>ms$1(c,"name",{value:l,configurable:!0});var Po=(c,l,d)=>{if(!l.has(c))throw TypeError("Cannot "+d)};var D$4=(c,l,d)=>(Po(c,l,"read from private field"),d?d.call(c):l.get(c)),ye$1=(c,l,d)=>{if(l.has(c))throw TypeError("Cannot add the same private member more than once");l instanceof WeakSet?l.add(c):l.set(c,d);},ne$3=(c,l,d,y)=>(Po(c,l,"write to private field"),l.set(c,d),d);var Pe$1,bt$2,ot$2,Zt$2,Ue$2,mt$2,yt$2,gt$2,oe$2,_t$2,Me$1,xe$1,St$2;Object.defineProperty(node$1,"__esModule",{value:!0});const http=require$$3,https=require$$4$1,zlib=require$$5,Stream=require$$6$1,require$$6=require$$7,require$$0=require$$8,_commonjsHelpers=nodeFetchNative_61758d11,require$$1=require$$10,require$$4=require$$11,node_fs=require$$0$1,node_path=require$$1$1;function _interopDefaultCompat(c){return c&&typeof c=="object"&&"default"in c?c.default:c}u$1(_interopDefaultCompat,"_interopDefaultCompat");const http__default=_interopDefaultCompat(http),https__default=_interopDefaultCompat(https),zlib__default=_interopDefaultCompat(zlib),Stream__default=_interopDefaultCompat(Stream);function dataUriToBuffer(c){if(!/^data:/i.test(c))throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');c=c.replace(/\r?\n/g,"");const l=c.indexOf(",");if(l===-1||l<=4)throw new TypeError("malformed data: URI");const d=c.substring(5,l).split(";");let y="",b=!1;const R=d[0]||"text/plain";let w=R;for(let F=1;F<d.length;F++)d[F]==="base64"?b=!0:d[F]&&(w+=`;${d[F]}`,d[F].indexOf("charset=")===0&&(y=d[F].substring(8)));!d[0]&&!y.length&&(w+=";charset=US-ASCII",y="US-ASCII");const v=b?"base64":"ascii",I=unescape(c.substring(l+1)),B=Buffer.from(I,v);return B.type=R,B.typeFull=w,B.charset=y,B}u$1(dataUriToBuffer,"dataUriToBuffer");var ponyfill_es2018={exports:{}};/**
 * @license
 * web-streams-polyfill v3.3.3
 * Copyright 2024 Mattias Buelens, Diwank Singh Tomer and other contributors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */var hasRequiredPonyfill_es2018;function requirePonyfill_es2018(){return hasRequiredPonyfill_es2018||(hasRequiredPonyfill_es2018=1,function(c,l){(function(d,y){y(l);})(_commonjsHelpers.commonjsGlobal,function(d){function y(){}u$1(y,"noop");function b(n){return typeof n=="object"&&n!==null||typeof n=="function"}u$1(b,"typeIsObject");const R=y;function w(n,o){try{Object.defineProperty(n,"name",{value:o,configurable:!0});}catch{}}u$1(w,"setFunctionName");const v=Promise,I=Promise.prototype.then,B=Promise.reject.bind(v);function F(n){return new v(n)}u$1(F,"newPromise");function k(n){return F(o=>o(n))}u$1(k,"promiseResolvedWith");function T(n){return B(n)}u$1(T,"promiseRejectedWith");function $(n,o,a){return I.call(n,o,a)}u$1($,"PerformPromiseThen");function E(n,o,a){$($(n,o,a),void 0,R);}u$1(E,"uponPromise");function K(n,o){E(n,o);}u$1(K,"uponFulfillment");function U(n,o){E(n,void 0,o);}u$1(U,"uponRejection");function N(n,o,a){return $(n,o,a)}u$1(N,"transformPromiseWith");function J(n){$(n,void 0,R);}u$1(J,"setPromiseIsHandledToTrue");let ge=u$1(n=>{if(typeof queueMicrotask=="function")ge=queueMicrotask;else {const o=k(void 0);ge=u$1(a=>$(o,a),"_queueMicrotask");}return ge(n)},"_queueMicrotask");function M(n,o,a){if(typeof n!="function")throw new TypeError("Argument is not a function");return Function.prototype.apply.call(n,o,a)}u$1(M,"reflectCall");function H(n,o,a){try{return k(M(n,o,a))}catch(p){return T(p)}}u$1(H,"promiseCall");const G=16384,Dr=class Dr{constructor(){this._cursor=0,this._size=0,this._front={_elements:[],_next:void 0},this._back=this._front,this._cursor=0,this._size=0;}get length(){return this._size}push(o){const a=this._back;let p=a;a._elements.length===G-1&&(p={_elements:[],_next:void 0}),a._elements.push(o),p!==a&&(this._back=p,a._next=p),++this._size;}shift(){const o=this._front;let a=o;const p=this._cursor;let g=p+1;const _=o._elements,S=_[p];return g===G&&(a=o._next,g=0),--this._size,this._cursor=g,o!==a&&(this._front=a),_[p]=void 0,S}forEach(o){let a=this._cursor,p=this._front,g=p._elements;for(;(a!==g.length||p._next!==void 0)&&!(a===g.length&&(p=p._next,g=p._elements,a=0,g.length===0));)o(g[a]),++a;}peek(){const o=this._front,a=this._cursor;return o._elements[a]}};u$1(Dr,"SimpleQueue");let Q=Dr;const wt=Symbol("[[AbortSteps]]"),un=Symbol("[[ErrorSteps]]"),er=Symbol("[[CancelSteps]]"),tr=Symbol("[[PullSteps]]"),rr=Symbol("[[ReleaseSteps]]");function ln(n,o){n._ownerReadableStream=o,o._reader=n,o._state==="readable"?or(n):o._state==="closed"?vo(n):fn(n,o._storedError);}u$1(ln,"ReadableStreamReaderGenericInitialize");function nr(n,o){const a=n._ownerReadableStream;return le(a,o)}u$1(nr,"ReadableStreamReaderGenericCancel");function _e(n){const o=n._ownerReadableStream;o._state==="readable"?ir(n,new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")):Eo(n,new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")),o._readableStreamController[rr](),o._reader=void 0,n._ownerReadableStream=void 0;}u$1(_e,"ReadableStreamReaderGenericRelease");function Rt(n){return new TypeError("Cannot "+n+" a stream using a released reader")}u$1(Rt,"readerLockException");function or(n){n._closedPromise=F((o,a)=>{n._closedPromise_resolve=o,n._closedPromise_reject=a;});}u$1(or,"defaultReaderClosedPromiseInitialize");function fn(n,o){or(n),ir(n,o);}u$1(fn,"defaultReaderClosedPromiseInitializeAsRejected");function vo(n){or(n),cn(n);}u$1(vo,"defaultReaderClosedPromiseInitializeAsResolved");function ir(n,o){n._closedPromise_reject!==void 0&&(J(n._closedPromise),n._closedPromise_reject(o),n._closedPromise_resolve=void 0,n._closedPromise_reject=void 0);}u$1(ir,"defaultReaderClosedPromiseReject");function Eo(n,o){fn(n,o);}u$1(Eo,"defaultReaderClosedPromiseResetToRejected");function cn(n){n._closedPromise_resolve!==void 0&&(n._closedPromise_resolve(void 0),n._closedPromise_resolve=void 0,n._closedPromise_reject=void 0);}u$1(cn,"defaultReaderClosedPromiseResolve");const dn=Number.isFinite||function(n){return typeof n=="number"&&isFinite(n)},Ao=Math.trunc||function(n){return n<0?Math.ceil(n):Math.floor(n)};function Bo(n){return typeof n=="object"||typeof n=="function"}u$1(Bo,"isDictionary");function ce(n,o){if(n!==void 0&&!Bo(n))throw new TypeError(`${o} is not an object.`)}u$1(ce,"assertDictionary");function ee(n,o){if(typeof n!="function")throw new TypeError(`${o} is not a function.`)}u$1(ee,"assertFunction");function qo(n){return typeof n=="object"&&n!==null||typeof n=="function"}u$1(qo,"isObject");function hn(n,o){if(!qo(n))throw new TypeError(`${o} is not an object.`)}u$1(hn,"assertObject");function Se(n,o,a){if(n===void 0)throw new TypeError(`Parameter ${o} is required in '${a}'.`)}u$1(Se,"assertRequiredArgument");function sr(n,o,a){if(n===void 0)throw new TypeError(`${o} is required in '${a}'.`)}u$1(sr,"assertRequiredField");function ar(n){return Number(n)}u$1(ar,"convertUnrestrictedDouble");function pn(n){return n===0?0:n}u$1(pn,"censorNegativeZero");function ko(n){return pn(Ao(n))}u$1(ko,"integerPart");function ur(n,o){const p=Number.MAX_SAFE_INTEGER;let g=Number(n);if(g=pn(g),!dn(g))throw new TypeError(`${o} is not a finite number`);if(g=ko(g),g<0||g>p)throw new TypeError(`${o} is outside the accepted range of 0 to ${p}, inclusive`);return !dn(g)||g===0?0:g}u$1(ur,"convertUnsignedLongLongWithEnforceRange");function lr(n,o){if(!qe(n))throw new TypeError(`${o} is not a ReadableStream.`)}u$1(lr,"assertReadableStream");function Ne(n){return new de(n)}u$1(Ne,"AcquireReadableStreamDefaultReader");function bn(n,o){n._reader._readRequests.push(o);}u$1(bn,"ReadableStreamAddReadRequest");function fr(n,o,a){const g=n._reader._readRequests.shift();a?g._closeSteps():g._chunkSteps(o);}u$1(fr,"ReadableStreamFulfillReadRequest");function Tt(n){return n._reader._readRequests.length}u$1(Tt,"ReadableStreamGetNumReadRequests");function mn(n){const o=n._reader;return !(o===void 0||!ve(o))}u$1(mn,"ReadableStreamHasDefaultReader");const Mr=class Mr{constructor(o){if(Se(o,1,"ReadableStreamDefaultReader"),lr(o,"First parameter"),ke(o))throw new TypeError("This stream has already been locked for exclusive reading by another reader");ln(this,o),this._readRequests=new Q;}get closed(){return ve(this)?this._closedPromise:T(Ct("closed"))}cancel(o=void 0){return ve(this)?this._ownerReadableStream===void 0?T(Rt("cancel")):nr(this,o):T(Ct("cancel"))}read(){if(!ve(this))return T(Ct("read"));if(this._ownerReadableStream===void 0)return T(Rt("read from"));let o,a;const p=F((_,S)=>{o=_,a=S;});return it(this,{_chunkSteps:_=>o({value:_,done:!1}),_closeSteps:()=>o({value:void 0,done:!0}),_errorSteps:_=>a(_)}),p}releaseLock(){if(!ve(this))throw Ct("releaseLock");this._ownerReadableStream!==void 0&&Wo(this);}};u$1(Mr,"ReadableStreamDefaultReader");let de=Mr;Object.defineProperties(de.prototype,{cancel:{enumerable:!0},read:{enumerable:!0},releaseLock:{enumerable:!0},closed:{enumerable:!0}}),w(de.prototype.cancel,"cancel"),w(de.prototype.read,"read"),w(de.prototype.releaseLock,"releaseLock"),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(de.prototype,Symbol.toStringTag,{value:"ReadableStreamDefaultReader",configurable:!0});function ve(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_readRequests")?!1:n instanceof de}u$1(ve,"IsReadableStreamDefaultReader");function it(n,o){const a=n._ownerReadableStream;a._disturbed=!0,a._state==="closed"?o._closeSteps():a._state==="errored"?o._errorSteps(a._storedError):a._readableStreamController[tr](o);}u$1(it,"ReadableStreamDefaultReaderRead");function Wo(n){_e(n);const o=new TypeError("Reader was released");yn(n,o);}u$1(Wo,"ReadableStreamDefaultReaderRelease");function yn(n,o){const a=n._readRequests;n._readRequests=new Q,a.forEach(p=>{p._errorSteps(o);});}u$1(yn,"ReadableStreamDefaultReaderErrorReadRequests");function Ct(n){return new TypeError(`ReadableStreamDefaultReader.prototype.${n} can only be used on a ReadableStreamDefaultReader`)}u$1(Ct,"defaultReaderBrandCheckException");const Oo=Object.getPrototypeOf(Object.getPrototypeOf(async function*(){}).prototype),xr=class xr{constructor(o,a){this._ongoingPromise=void 0,this._isFinished=!1,this._reader=o,this._preventCancel=a;}next(){const o=u$1(()=>this._nextSteps(),"nextSteps");return this._ongoingPromise=this._ongoingPromise?N(this._ongoingPromise,o,o):o(),this._ongoingPromise}return(o){const a=u$1(()=>this._returnSteps(o),"returnSteps");return this._ongoingPromise?N(this._ongoingPromise,a,a):a()}_nextSteps(){if(this._isFinished)return Promise.resolve({value:void 0,done:!0});const o=this._reader;let a,p;const g=F((S,C)=>{a=S,p=C;});return it(o,{_chunkSteps:S=>{this._ongoingPromise=void 0,ge(()=>a({value:S,done:!1}));},_closeSteps:()=>{this._ongoingPromise=void 0,this._isFinished=!0,_e(o),a({value:void 0,done:!0});},_errorSteps:S=>{this._ongoingPromise=void 0,this._isFinished=!0,_e(o),p(S);}}),g}_returnSteps(o){if(this._isFinished)return Promise.resolve({value:o,done:!0});this._isFinished=!0;const a=this._reader;if(!this._preventCancel){const p=nr(a,o);return _e(a),N(p,()=>({value:o,done:!0}))}return _e(a),k({value:o,done:!0})}};u$1(xr,"ReadableStreamAsyncIteratorImpl");let Pt=xr;const gn={next(){return _n(this)?this._asyncIteratorImpl.next():T(Sn("next"))},return(n){return _n(this)?this._asyncIteratorImpl.return(n):T(Sn("return"))}};Object.setPrototypeOf(gn,Oo);function zo(n,o){const a=Ne(n),p=new Pt(a,o),g=Object.create(gn);return g._asyncIteratorImpl=p,g}u$1(zo,"AcquireReadableStreamAsyncIterator");function _n(n){if(!b(n)||!Object.prototype.hasOwnProperty.call(n,"_asyncIteratorImpl"))return !1;try{return n._asyncIteratorImpl instanceof Pt}catch{return !1}}u$1(_n,"IsReadableStreamAsyncIterator");function Sn(n){return new TypeError(`ReadableStreamAsyncIterator.${n} can only be used on a ReadableSteamAsyncIterator`)}u$1(Sn,"streamAsyncIteratorBrandCheckException");const wn=Number.isNaN||function(n){return n!==n};var cr,dr,hr;function st(n){return n.slice()}u$1(st,"CreateArrayFromList");function Rn(n,o,a,p,g){new Uint8Array(n).set(new Uint8Array(a,p,g),o);}u$1(Rn,"CopyDataBlockBytes");let we=u$1(n=>(typeof n.transfer=="function"?we=u$1(o=>o.transfer(),"TransferArrayBuffer"):typeof structuredClone=="function"?we=u$1(o=>structuredClone(o,{transfer:[o]}),"TransferArrayBuffer"):we=u$1(o=>o,"TransferArrayBuffer"),we(n)),"TransferArrayBuffer"),Ee=u$1(n=>(typeof n.detached=="boolean"?Ee=u$1(o=>o.detached,"IsDetachedBuffer"):Ee=u$1(o=>o.byteLength===0,"IsDetachedBuffer"),Ee(n)),"IsDetachedBuffer");function Tn(n,o,a){if(n.slice)return n.slice(o,a);const p=a-o,g=new ArrayBuffer(p);return Rn(g,0,n,o,p),g}u$1(Tn,"ArrayBufferSlice");function vt(n,o){const a=n[o];if(a!=null){if(typeof a!="function")throw new TypeError(`${String(o)} is not a function`);return a}}u$1(vt,"GetMethod");function Fo(n){const o={[Symbol.iterator]:()=>n.iterator},a=async function*(){return yield*o}(),p=a.next;return {iterator:a,nextMethod:p,done:!1}}u$1(Fo,"CreateAsyncFromSyncIterator");const pr=(hr=(cr=Symbol.asyncIterator)!==null&&cr!==void 0?cr:(dr=Symbol.for)===null||dr===void 0?void 0:dr.call(Symbol,"Symbol.asyncIterator"))!==null&&hr!==void 0?hr:"@@asyncIterator";function Cn(n,o="sync",a){if(a===void 0)if(o==="async"){if(a=vt(n,pr),a===void 0){const _=vt(n,Symbol.iterator),S=Cn(n,"sync",_);return Fo(S)}}else a=vt(n,Symbol.iterator);if(a===void 0)throw new TypeError("The object is not iterable");const p=M(a,n,[]);if(!b(p))throw new TypeError("The iterator method must return an object");const g=p.next;return {iterator:p,nextMethod:g,done:!1}}u$1(Cn,"GetIterator");function Io(n){const o=M(n.nextMethod,n.iterator,[]);if(!b(o))throw new TypeError("The iterator.next() method must return an object");return o}u$1(Io,"IteratorNext");function jo(n){return !!n.done}u$1(jo,"IteratorComplete");function Lo(n){return n.value}u$1(Lo,"IteratorValue");function $o(n){return !(typeof n!="number"||wn(n)||n<0)}u$1($o,"IsNonNegativeNumber");function Pn(n){const o=Tn(n.buffer,n.byteOffset,n.byteOffset+n.byteLength);return new Uint8Array(o)}u$1(Pn,"CloneAsUint8Array");function br(n){const o=n._queue.shift();return n._queueTotalSize-=o.size,n._queueTotalSize<0&&(n._queueTotalSize=0),o.value}u$1(br,"DequeueValue");function mr(n,o,a){if(!$o(a)||a===1/0)throw new RangeError("Size must be a finite, non-NaN, non-negative number.");n._queue.push({value:o,size:a}),n._queueTotalSize+=a;}u$1(mr,"EnqueueValueWithSize");function Do(n){return n._queue.peek().value}u$1(Do,"PeekQueueValue");function Ae(n){n._queue=new Q,n._queueTotalSize=0;}u$1(Ae,"ResetQueue");function vn(n){return n===DataView}u$1(vn,"isDataViewConstructor");function Mo(n){return vn(n.constructor)}u$1(Mo,"isDataView");function xo(n){return vn(n)?1:n.BYTES_PER_ELEMENT}u$1(xo,"arrayBufferViewElementSize");const Ur=class Ur{constructor(){throw new TypeError("Illegal constructor")}get view(){if(!yr(this))throw Rr("view");return this._view}respond(o){if(!yr(this))throw Rr("respond");if(Se(o,1,"respond"),o=ur(o,"First parameter"),this._associatedReadableByteStreamController===void 0)throw new TypeError("This BYOB request has been invalidated");if(Ee(this._view.buffer))throw new TypeError("The BYOB request's buffer has been detached and so cannot be used as a response");qt(this._associatedReadableByteStreamController,o);}respondWithNewView(o){if(!yr(this))throw Rr("respondWithNewView");if(Se(o,1,"respondWithNewView"),!ArrayBuffer.isView(o))throw new TypeError("You can only respond with array buffer views");if(this._associatedReadableByteStreamController===void 0)throw new TypeError("This BYOB request has been invalidated");if(Ee(o.buffer))throw new TypeError("The given view's buffer has been detached and so cannot be used as a response");kt(this._associatedReadableByteStreamController,o);}};u$1(Ur,"ReadableStreamBYOBRequest");let Re=Ur;Object.defineProperties(Re.prototype,{respond:{enumerable:!0},respondWithNewView:{enumerable:!0},view:{enumerable:!0}}),w(Re.prototype.respond,"respond"),w(Re.prototype.respondWithNewView,"respondWithNewView"),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(Re.prototype,Symbol.toStringTag,{value:"ReadableStreamBYOBRequest",configurable:!0});const Nr=class Nr{constructor(){throw new TypeError("Illegal constructor")}get byobRequest(){if(!Oe(this))throw ut("byobRequest");return wr(this)}get desiredSize(){if(!Oe(this))throw ut("desiredSize");return In(this)}close(){if(!Oe(this))throw ut("close");if(this._closeRequested)throw new TypeError("The stream has already been closed; do not close it again!");const o=this._controlledReadableByteStream._state;if(o!=="readable")throw new TypeError(`The stream (in ${o} state) is not in the readable state and cannot be closed`);at(this);}enqueue(o){if(!Oe(this))throw ut("enqueue");if(Se(o,1,"enqueue"),!ArrayBuffer.isView(o))throw new TypeError("chunk must be an array buffer view");if(o.byteLength===0)throw new TypeError("chunk must have non-zero byteLength");if(o.buffer.byteLength===0)throw new TypeError("chunk's buffer must have non-zero byteLength");if(this._closeRequested)throw new TypeError("stream is closed or draining");const a=this._controlledReadableByteStream._state;if(a!=="readable")throw new TypeError(`The stream (in ${a} state) is not in the readable state and cannot be enqueued to`);Bt(this,o);}error(o=void 0){if(!Oe(this))throw ut("error");te(this,o);}[er](o){En(this),Ae(this);const a=this._cancelAlgorithm(o);return At(this),a}[tr](o){const a=this._controlledReadableByteStream;if(this._queueTotalSize>0){Fn(this,o);return}const p=this._autoAllocateChunkSize;if(p!==void 0){let g;try{g=new ArrayBuffer(p);}catch(S){o._errorSteps(S);return}const _={buffer:g,bufferByteLength:p,byteOffset:0,byteLength:p,bytesFilled:0,minimumFill:1,elementSize:1,viewConstructor:Uint8Array,readerType:"default"};this._pendingPullIntos.push(_);}bn(a,o),ze(this);}[rr](){if(this._pendingPullIntos.length>0){const o=this._pendingPullIntos.peek();o.readerType="none",this._pendingPullIntos=new Q,this._pendingPullIntos.push(o);}}};u$1(Nr,"ReadableByteStreamController");let ie=Nr;Object.defineProperties(ie.prototype,{close:{enumerable:!0},enqueue:{enumerable:!0},error:{enumerable:!0},byobRequest:{enumerable:!0},desiredSize:{enumerable:!0}}),w(ie.prototype.close,"close"),w(ie.prototype.enqueue,"enqueue"),w(ie.prototype.error,"error"),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(ie.prototype,Symbol.toStringTag,{value:"ReadableByteStreamController",configurable:!0});function Oe(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_controlledReadableByteStream")?!1:n instanceof ie}u$1(Oe,"IsReadableByteStreamController");function yr(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_associatedReadableByteStreamController")?!1:n instanceof Re}u$1(yr,"IsReadableStreamBYOBRequest");function ze(n){if(!Qo(n))return;if(n._pulling){n._pullAgain=!0;return}n._pulling=!0;const a=n._pullAlgorithm();E(a,()=>(n._pulling=!1,n._pullAgain&&(n._pullAgain=!1,ze(n)),null),p=>(te(n,p),null));}u$1(ze,"ReadableByteStreamControllerCallPullIfNeeded");function En(n){_r(n),n._pendingPullIntos=new Q;}u$1(En,"ReadableByteStreamControllerClearPendingPullIntos");function gr(n,o){let a=!1;n._state==="closed"&&(a=!0);const p=An(o);o.readerType==="default"?fr(n,p,a):Xo(n,p,a);}u$1(gr,"ReadableByteStreamControllerCommitPullIntoDescriptor");function An(n){const o=n.bytesFilled,a=n.elementSize;return new n.viewConstructor(n.buffer,n.byteOffset,o/a)}u$1(An,"ReadableByteStreamControllerConvertPullIntoDescriptor");function Et(n,o,a,p){n._queue.push({buffer:o,byteOffset:a,byteLength:p}),n._queueTotalSize+=p;}u$1(Et,"ReadableByteStreamControllerEnqueueChunkToQueue");function Bn(n,o,a,p){let g;try{g=Tn(o,a,a+p);}catch(_){throw te(n,_),_}Et(n,g,0,p);}u$1(Bn,"ReadableByteStreamControllerEnqueueClonedChunkToQueue");function qn(n,o){o.bytesFilled>0&&Bn(n,o.buffer,o.byteOffset,o.bytesFilled),He(n);}u$1(qn,"ReadableByteStreamControllerEnqueueDetachedPullIntoToQueue");function kn(n,o){const a=Math.min(n._queueTotalSize,o.byteLength-o.bytesFilled),p=o.bytesFilled+a;let g=a,_=!1;const S=p%o.elementSize,C=p-S;C>=o.minimumFill&&(g=C-o.bytesFilled,_=!0);const q=n._queue;for(;g>0;){const P=q.peek(),W=Math.min(g,P.byteLength),O=o.byteOffset+o.bytesFilled;Rn(o.buffer,O,P.buffer,P.byteOffset,W),P.byteLength===W?q.shift():(P.byteOffset+=W,P.byteLength-=W),n._queueTotalSize-=W,Wn(n,W,o),g-=W;}return _}u$1(kn,"ReadableByteStreamControllerFillPullIntoDescriptorFromQueue");function Wn(n,o,a){a.bytesFilled+=o;}u$1(Wn,"ReadableByteStreamControllerFillHeadPullIntoDescriptor");function On(n){n._queueTotalSize===0&&n._closeRequested?(At(n),pt(n._controlledReadableByteStream)):ze(n);}u$1(On,"ReadableByteStreamControllerHandleQueueDrain");function _r(n){n._byobRequest!==null&&(n._byobRequest._associatedReadableByteStreamController=void 0,n._byobRequest._view=null,n._byobRequest=null);}u$1(_r,"ReadableByteStreamControllerInvalidateBYOBRequest");function Sr(n){for(;n._pendingPullIntos.length>0;){if(n._queueTotalSize===0)return;const o=n._pendingPullIntos.peek();kn(n,o)&&(He(n),gr(n._controlledReadableByteStream,o));}}u$1(Sr,"ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue");function Uo(n){const o=n._controlledReadableByteStream._reader;for(;o._readRequests.length>0;){if(n._queueTotalSize===0)return;const a=o._readRequests.shift();Fn(n,a);}}u$1(Uo,"ReadableByteStreamControllerProcessReadRequestsUsingQueue");function No(n,o,a,p){const g=n._controlledReadableByteStream,_=o.constructor,S=xo(_),{byteOffset:C,byteLength:q}=o,P=a*S;let W;try{W=we(o.buffer);}catch(j){p._errorSteps(j);return}const O={buffer:W,bufferByteLength:W.byteLength,byteOffset:C,byteLength:q,bytesFilled:0,minimumFill:P,elementSize:S,viewConstructor:_,readerType:"byob"};if(n._pendingPullIntos.length>0){n._pendingPullIntos.push(O),$n(g,p);return}if(g._state==="closed"){const j=new _(O.buffer,O.byteOffset,0);p._closeSteps(j);return}if(n._queueTotalSize>0){if(kn(n,O)){const j=An(O);On(n),p._chunkSteps(j);return}if(n._closeRequested){const j=new TypeError("Insufficient bytes to fill elements in the given buffer");te(n,j),p._errorSteps(j);return}}n._pendingPullIntos.push(O),$n(g,p),ze(n);}u$1(No,"ReadableByteStreamControllerPullInto");function Ho(n,o){o.readerType==="none"&&He(n);const a=n._controlledReadableByteStream;if(Tr(a))for(;Dn(a)>0;){const p=He(n);gr(a,p);}}u$1(Ho,"ReadableByteStreamControllerRespondInClosedState");function Vo(n,o,a){if(Wn(n,o,a),a.readerType==="none"){qn(n,a),Sr(n);return}if(a.bytesFilled<a.minimumFill)return;He(n);const p=a.bytesFilled%a.elementSize;if(p>0){const g=a.byteOffset+a.bytesFilled;Bn(n,a.buffer,g-p,p);}a.bytesFilled-=p,gr(n._controlledReadableByteStream,a),Sr(n);}u$1(Vo,"ReadableByteStreamControllerRespondInReadableState");function zn(n,o){const a=n._pendingPullIntos.peek();_r(n),n._controlledReadableByteStream._state==="closed"?Ho(n,a):Vo(n,o,a),ze(n);}u$1(zn,"ReadableByteStreamControllerRespondInternal");function He(n){return n._pendingPullIntos.shift()}u$1(He,"ReadableByteStreamControllerShiftPendingPullInto");function Qo(n){const o=n._controlledReadableByteStream;return o._state!=="readable"||n._closeRequested||!n._started?!1:!!(mn(o)&&Tt(o)>0||Tr(o)&&Dn(o)>0||In(n)>0)}u$1(Qo,"ReadableByteStreamControllerShouldCallPull");function At(n){n._pullAlgorithm=void 0,n._cancelAlgorithm=void 0;}u$1(At,"ReadableByteStreamControllerClearAlgorithms");function at(n){const o=n._controlledReadableByteStream;if(!(n._closeRequested||o._state!=="readable")){if(n._queueTotalSize>0){n._closeRequested=!0;return}if(n._pendingPullIntos.length>0){const a=n._pendingPullIntos.peek();if(a.bytesFilled%a.elementSize!==0){const p=new TypeError("Insufficient bytes to fill elements in the given buffer");throw te(n,p),p}}At(n),pt(o);}}u$1(at,"ReadableByteStreamControllerClose");function Bt(n,o){const a=n._controlledReadableByteStream;if(n._closeRequested||a._state!=="readable")return;const{buffer:p,byteOffset:g,byteLength:_}=o;if(Ee(p))throw new TypeError("chunk's buffer is detached and so cannot be enqueued");const S=we(p);if(n._pendingPullIntos.length>0){const C=n._pendingPullIntos.peek();if(Ee(C.buffer))throw new TypeError("The BYOB request's buffer has been detached and so cannot be filled with an enqueued chunk");_r(n),C.buffer=we(C.buffer),C.readerType==="none"&&qn(n,C);}if(mn(a))if(Uo(n),Tt(a)===0)Et(n,S,g,_);else {n._pendingPullIntos.length>0&&He(n);const C=new Uint8Array(S,g,_);fr(a,C,!1);}else Tr(a)?(Et(n,S,g,_),Sr(n)):Et(n,S,g,_);ze(n);}u$1(Bt,"ReadableByteStreamControllerEnqueue");function te(n,o){const a=n._controlledReadableByteStream;a._state==="readable"&&(En(n),Ae(n),At(n),fo(a,o));}u$1(te,"ReadableByteStreamControllerError");function Fn(n,o){const a=n._queue.shift();n._queueTotalSize-=a.byteLength,On(n);const p=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);o._chunkSteps(p);}u$1(Fn,"ReadableByteStreamControllerFillReadRequestFromQueue");function wr(n){if(n._byobRequest===null&&n._pendingPullIntos.length>0){const o=n._pendingPullIntos.peek(),a=new Uint8Array(o.buffer,o.byteOffset+o.bytesFilled,o.byteLength-o.bytesFilled),p=Object.create(Re.prototype);Yo(p,n,a),n._byobRequest=p;}return n._byobRequest}u$1(wr,"ReadableByteStreamControllerGetBYOBRequest");function In(n){const o=n._controlledReadableByteStream._state;return o==="errored"?null:o==="closed"?0:n._strategyHWM-n._queueTotalSize}u$1(In,"ReadableByteStreamControllerGetDesiredSize");function qt(n,o){const a=n._pendingPullIntos.peek();if(n._controlledReadableByteStream._state==="closed"){if(o!==0)throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream")}else {if(o===0)throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");if(a.bytesFilled+o>a.byteLength)throw new RangeError("bytesWritten out of range")}a.buffer=we(a.buffer),zn(n,o);}u$1(qt,"ReadableByteStreamControllerRespond");function kt(n,o){const a=n._pendingPullIntos.peek();if(n._controlledReadableByteStream._state==="closed"){if(o.byteLength!==0)throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream")}else if(o.byteLength===0)throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");if(a.byteOffset+a.bytesFilled!==o.byteOffset)throw new RangeError("The region specified by view does not match byobRequest");if(a.bufferByteLength!==o.buffer.byteLength)throw new RangeError("The buffer of view has different capacity than byobRequest");if(a.bytesFilled+o.byteLength>a.byteLength)throw new RangeError("The region specified by view is larger than byobRequest");const g=o.byteLength;a.buffer=we(o.buffer),zn(n,g);}u$1(kt,"ReadableByteStreamControllerRespondWithNewView");function jn(n,o,a,p,g,_,S){o._controlledReadableByteStream=n,o._pullAgain=!1,o._pulling=!1,o._byobRequest=null,o._queue=o._queueTotalSize=void 0,Ae(o),o._closeRequested=!1,o._started=!1,o._strategyHWM=_,o._pullAlgorithm=p,o._cancelAlgorithm=g,o._autoAllocateChunkSize=S,o._pendingPullIntos=new Q,n._readableStreamController=o;const C=a();E(k(C),()=>(o._started=!0,ze(o),null),q=>(te(o,q),null));}u$1(jn,"SetUpReadableByteStreamController");function Go(n,o,a){const p=Object.create(ie.prototype);let g,_,S;o.start!==void 0?g=u$1(()=>o.start(p),"startAlgorithm"):g=u$1(()=>{},"startAlgorithm"),o.pull!==void 0?_=u$1(()=>o.pull(p),"pullAlgorithm"):_=u$1(()=>k(void 0),"pullAlgorithm"),o.cancel!==void 0?S=u$1(q=>o.cancel(q),"cancelAlgorithm"):S=u$1(()=>k(void 0),"cancelAlgorithm");const C=o.autoAllocateChunkSize;if(C===0)throw new TypeError("autoAllocateChunkSize must be greater than 0");jn(n,p,g,_,S,a,C);}u$1(Go,"SetUpReadableByteStreamControllerFromUnderlyingSource");function Yo(n,o,a){n._associatedReadableByteStreamController=o,n._view=a;}u$1(Yo,"SetUpReadableStreamBYOBRequest");function Rr(n){return new TypeError(`ReadableStreamBYOBRequest.prototype.${n} can only be used on a ReadableStreamBYOBRequest`)}u$1(Rr,"byobRequestBrandCheckException");function ut(n){return new TypeError(`ReadableByteStreamController.prototype.${n} can only be used on a ReadableByteStreamController`)}u$1(ut,"byteStreamControllerBrandCheckException");function Zo(n,o){ce(n,o);const a=n?.mode;return {mode:a===void 0?void 0:Ko(a,`${o} has member 'mode' that`)}}u$1(Zo,"convertReaderOptions");function Ko(n,o){if(n=`${n}`,n!=="byob")throw new TypeError(`${o} '${n}' is not a valid enumeration value for ReadableStreamReaderMode`);return n}u$1(Ko,"convertReadableStreamReaderMode");function Jo(n,o){var a;ce(n,o);const p=(a=n?.min)!==null&&a!==void 0?a:1;return {min:ur(p,`${o} has member 'min' that`)}}u$1(Jo,"convertByobReadOptions");function Ln(n){return new he(n)}u$1(Ln,"AcquireReadableStreamBYOBReader");function $n(n,o){n._reader._readIntoRequests.push(o);}u$1($n,"ReadableStreamAddReadIntoRequest");function Xo(n,o,a){const g=n._reader._readIntoRequests.shift();a?g._closeSteps(o):g._chunkSteps(o);}u$1(Xo,"ReadableStreamFulfillReadIntoRequest");function Dn(n){return n._reader._readIntoRequests.length}u$1(Dn,"ReadableStreamGetNumReadIntoRequests");function Tr(n){const o=n._reader;return !(o===void 0||!Fe(o))}u$1(Tr,"ReadableStreamHasBYOBReader");const Hr=class Hr{constructor(o){if(Se(o,1,"ReadableStreamBYOBReader"),lr(o,"First parameter"),ke(o))throw new TypeError("This stream has already been locked for exclusive reading by another reader");if(!Oe(o._readableStreamController))throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");ln(this,o),this._readIntoRequests=new Q;}get closed(){return Fe(this)?this._closedPromise:T(Wt("closed"))}cancel(o=void 0){return Fe(this)?this._ownerReadableStream===void 0?T(Rt("cancel")):nr(this,o):T(Wt("cancel"))}read(o,a={}){if(!Fe(this))return T(Wt("read"));if(!ArrayBuffer.isView(o))return T(new TypeError("view must be an array buffer view"));if(o.byteLength===0)return T(new TypeError("view must have non-zero byteLength"));if(o.buffer.byteLength===0)return T(new TypeError("view's buffer must have non-zero byteLength"));if(Ee(o.buffer))return T(new TypeError("view's buffer has been detached"));let p;try{p=Jo(a,"options");}catch(P){return T(P)}const g=p.min;if(g===0)return T(new TypeError("options.min must be greater than 0"));if(Mo(o)){if(g>o.byteLength)return T(new RangeError("options.min must be less than or equal to view's byteLength"))}else if(g>o.length)return T(new RangeError("options.min must be less than or equal to view's length"));if(this._ownerReadableStream===void 0)return T(Rt("read from"));let _,S;const C=F((P,W)=>{_=P,S=W;});return Mn(this,o,g,{_chunkSteps:P=>_({value:P,done:!1}),_closeSteps:P=>_({value:P,done:!0}),_errorSteps:P=>S(P)}),C}releaseLock(){if(!Fe(this))throw Wt("releaseLock");this._ownerReadableStream!==void 0&&ei(this);}};u$1(Hr,"ReadableStreamBYOBReader");let he=Hr;Object.defineProperties(he.prototype,{cancel:{enumerable:!0},read:{enumerable:!0},releaseLock:{enumerable:!0},closed:{enumerable:!0}}),w(he.prototype.cancel,"cancel"),w(he.prototype.read,"read"),w(he.prototype.releaseLock,"releaseLock"),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(he.prototype,Symbol.toStringTag,{value:"ReadableStreamBYOBReader",configurable:!0});function Fe(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_readIntoRequests")?!1:n instanceof he}u$1(Fe,"IsReadableStreamBYOBReader");function Mn(n,o,a,p){const g=n._ownerReadableStream;g._disturbed=!0,g._state==="errored"?p._errorSteps(g._storedError):No(g._readableStreamController,o,a,p);}u$1(Mn,"ReadableStreamBYOBReaderRead");function ei(n){_e(n);const o=new TypeError("Reader was released");xn(n,o);}u$1(ei,"ReadableStreamBYOBReaderRelease");function xn(n,o){const a=n._readIntoRequests;n._readIntoRequests=new Q,a.forEach(p=>{p._errorSteps(o);});}u$1(xn,"ReadableStreamBYOBReaderErrorReadIntoRequests");function Wt(n){return new TypeError(`ReadableStreamBYOBReader.prototype.${n} can only be used on a ReadableStreamBYOBReader`)}u$1(Wt,"byobReaderBrandCheckException");function lt(n,o){const{highWaterMark:a}=n;if(a===void 0)return o;if(wn(a)||a<0)throw new RangeError("Invalid highWaterMark");return a}u$1(lt,"ExtractHighWaterMark");function Ot(n){const{size:o}=n;return o||(()=>1)}u$1(Ot,"ExtractSizeAlgorithm");function zt(n,o){ce(n,o);const a=n?.highWaterMark,p=n?.size;return {highWaterMark:a===void 0?void 0:ar(a),size:p===void 0?void 0:ti(p,`${o} has member 'size' that`)}}u$1(zt,"convertQueuingStrategy");function ti(n,o){return ee(n,o),a=>ar(n(a))}u$1(ti,"convertQueuingStrategySize");function ri(n,o){ce(n,o);const a=n?.abort,p=n?.close,g=n?.start,_=n?.type,S=n?.write;return {abort:a===void 0?void 0:ni(a,n,`${o} has member 'abort' that`),close:p===void 0?void 0:oi(p,n,`${o} has member 'close' that`),start:g===void 0?void 0:ii(g,n,`${o} has member 'start' that`),write:S===void 0?void 0:si(S,n,`${o} has member 'write' that`),type:_}}u$1(ri,"convertUnderlyingSink");function ni(n,o,a){return ee(n,a),p=>H(n,o,[p])}u$1(ni,"convertUnderlyingSinkAbortCallback");function oi(n,o,a){return ee(n,a),()=>H(n,o,[])}u$1(oi,"convertUnderlyingSinkCloseCallback");function ii(n,o,a){return ee(n,a),p=>M(n,o,[p])}u$1(ii,"convertUnderlyingSinkStartCallback");function si(n,o,a){return ee(n,a),(p,g)=>H(n,o,[p,g])}u$1(si,"convertUnderlyingSinkWriteCallback");function Un(n,o){if(!Ve(n))throw new TypeError(`${o} is not a WritableStream.`)}u$1(Un,"assertWritableStream");function ai(n){if(typeof n!="object"||n===null)return !1;try{return typeof n.aborted=="boolean"}catch{return !1}}u$1(ai,"isAbortSignal");const ui=typeof AbortController=="function";function li(){if(ui)return new AbortController}u$1(li,"createAbortController");const Vr=class Vr{constructor(o={},a={}){o===void 0?o=null:hn(o,"First parameter");const p=zt(a,"Second parameter"),g=ri(o,"First parameter");if(Hn(this),g.type!==void 0)throw new RangeError("Invalid type is specified");const S=Ot(p),C=lt(p,1);Ti(this,g,C,S);}get locked(){if(!Ve(this))throw $t("locked");return Qe(this)}abort(o=void 0){return Ve(this)?Qe(this)?T(new TypeError("Cannot abort a stream that already has a writer")):Ft(this,o):T($t("abort"))}close(){return Ve(this)?Qe(this)?T(new TypeError("Cannot close a stream that already has a writer")):be(this)?T(new TypeError("Cannot close an already-closing stream")):Vn(this):T($t("close"))}getWriter(){if(!Ve(this))throw $t("getWriter");return Nn(this)}};u$1(Vr,"WritableStream");let pe=Vr;Object.defineProperties(pe.prototype,{abort:{enumerable:!0},close:{enumerable:!0},getWriter:{enumerable:!0},locked:{enumerable:!0}}),w(pe.prototype.abort,"abort"),w(pe.prototype.close,"close"),w(pe.prototype.getWriter,"getWriter"),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(pe.prototype,Symbol.toStringTag,{value:"WritableStream",configurable:!0});function Nn(n){return new se(n)}u$1(Nn,"AcquireWritableStreamDefaultWriter");function fi(n,o,a,p,g=1,_=()=>1){const S=Object.create(pe.prototype);Hn(S);const C=Object.create(Be.prototype);return Jn(S,C,n,o,a,p,g,_),S}u$1(fi,"CreateWritableStream");function Hn(n){n._state="writable",n._storedError=void 0,n._writer=void 0,n._writableStreamController=void 0,n._writeRequests=new Q,n._inFlightWriteRequest=void 0,n._closeRequest=void 0,n._inFlightCloseRequest=void 0,n._pendingAbortRequest=void 0,n._backpressure=!1;}u$1(Hn,"InitializeWritableStream");function Ve(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_writableStreamController")?!1:n instanceof pe}u$1(Ve,"IsWritableStream");function Qe(n){return n._writer!==void 0}u$1(Qe,"IsWritableStreamLocked");function Ft(n,o){var a;if(n._state==="closed"||n._state==="errored")return k(void 0);n._writableStreamController._abortReason=o,(a=n._writableStreamController._abortController)===null||a===void 0||a.abort(o);const p=n._state;if(p==="closed"||p==="errored")return k(void 0);if(n._pendingAbortRequest!==void 0)return n._pendingAbortRequest._promise;let g=!1;p==="erroring"&&(g=!0,o=void 0);const _=F((S,C)=>{n._pendingAbortRequest={_promise:void 0,_resolve:S,_reject:C,_reason:o,_wasAlreadyErroring:g};});return n._pendingAbortRequest._promise=_,g||Pr(n,o),_}u$1(Ft,"WritableStreamAbort");function Vn(n){const o=n._state;if(o==="closed"||o==="errored")return T(new TypeError(`The stream (in ${o} state) is not in the writable state and cannot be closed`));const a=F((g,_)=>{const S={_resolve:g,_reject:_};n._closeRequest=S;}),p=n._writer;return p!==void 0&&n._backpressure&&o==="writable"&&Or(p),Ci(n._writableStreamController),a}u$1(Vn,"WritableStreamClose");function ci(n){return F((a,p)=>{const g={_resolve:a,_reject:p};n._writeRequests.push(g);})}u$1(ci,"WritableStreamAddWriteRequest");function Cr(n,o){if(n._state==="writable"){Pr(n,o);return}vr(n);}u$1(Cr,"WritableStreamDealWithRejection");function Pr(n,o){const a=n._writableStreamController;n._state="erroring",n._storedError=o;const p=n._writer;p!==void 0&&Gn(p,o),!mi(n)&&a._started&&vr(n);}u$1(Pr,"WritableStreamStartErroring");function vr(n){n._state="errored",n._writableStreamController[un]();const o=n._storedError;if(n._writeRequests.forEach(g=>{g._reject(o);}),n._writeRequests=new Q,n._pendingAbortRequest===void 0){It(n);return}const a=n._pendingAbortRequest;if(n._pendingAbortRequest=void 0,a._wasAlreadyErroring){a._reject(o),It(n);return}const p=n._writableStreamController[wt](a._reason);E(p,()=>(a._resolve(),It(n),null),g=>(a._reject(g),It(n),null));}u$1(vr,"WritableStreamFinishErroring");function di(n){n._inFlightWriteRequest._resolve(void 0),n._inFlightWriteRequest=void 0;}u$1(di,"WritableStreamFinishInFlightWrite");function hi(n,o){n._inFlightWriteRequest._reject(o),n._inFlightWriteRequest=void 0,Cr(n,o);}u$1(hi,"WritableStreamFinishInFlightWriteWithError");function pi(n){n._inFlightCloseRequest._resolve(void 0),n._inFlightCloseRequest=void 0,n._state==="erroring"&&(n._storedError=void 0,n._pendingAbortRequest!==void 0&&(n._pendingAbortRequest._resolve(),n._pendingAbortRequest=void 0)),n._state="closed";const a=n._writer;a!==void 0&&ro(a);}u$1(pi,"WritableStreamFinishInFlightClose");function bi(n,o){n._inFlightCloseRequest._reject(o),n._inFlightCloseRequest=void 0,n._pendingAbortRequest!==void 0&&(n._pendingAbortRequest._reject(o),n._pendingAbortRequest=void 0),Cr(n,o);}u$1(bi,"WritableStreamFinishInFlightCloseWithError");function be(n){return !(n._closeRequest===void 0&&n._inFlightCloseRequest===void 0)}u$1(be,"WritableStreamCloseQueuedOrInFlight");function mi(n){return !(n._inFlightWriteRequest===void 0&&n._inFlightCloseRequest===void 0)}u$1(mi,"WritableStreamHasOperationMarkedInFlight");function yi(n){n._inFlightCloseRequest=n._closeRequest,n._closeRequest=void 0;}u$1(yi,"WritableStreamMarkCloseRequestInFlight");function gi(n){n._inFlightWriteRequest=n._writeRequests.shift();}u$1(gi,"WritableStreamMarkFirstWriteRequestInFlight");function It(n){n._closeRequest!==void 0&&(n._closeRequest._reject(n._storedError),n._closeRequest=void 0);const o=n._writer;o!==void 0&&kr(o,n._storedError);}u$1(It,"WritableStreamRejectCloseAndClosedPromiseIfNeeded");function Er(n,o){const a=n._writer;a!==void 0&&o!==n._backpressure&&(o?ki(a):Or(a)),n._backpressure=o;}u$1(Er,"WritableStreamUpdateBackpressure");const Qr=class Qr{constructor(o){if(Se(o,1,"WritableStreamDefaultWriter"),Un(o,"First parameter"),Qe(o))throw new TypeError("This stream has already been locked for exclusive writing by another writer");this._ownerWritableStream=o,o._writer=this;const a=o._state;if(a==="writable")!be(o)&&o._backpressure?Mt(this):no(this),Dt(this);else if(a==="erroring")Wr(this,o._storedError),Dt(this);else if(a==="closed")no(this),Bi(this);else {const p=o._storedError;Wr(this,p),to(this,p);}}get closed(){return Ie(this)?this._closedPromise:T(je("closed"))}get desiredSize(){if(!Ie(this))throw je("desiredSize");if(this._ownerWritableStream===void 0)throw ct("desiredSize");return Ri(this)}get ready(){return Ie(this)?this._readyPromise:T(je("ready"))}abort(o=void 0){return Ie(this)?this._ownerWritableStream===void 0?T(ct("abort")):_i(this,o):T(je("abort"))}close(){if(!Ie(this))return T(je("close"));const o=this._ownerWritableStream;return o===void 0?T(ct("close")):be(o)?T(new TypeError("Cannot close an already-closing stream")):Qn(this)}releaseLock(){if(!Ie(this))throw je("releaseLock");this._ownerWritableStream!==void 0&&Yn(this);}write(o=void 0){return Ie(this)?this._ownerWritableStream===void 0?T(ct("write to")):Zn(this,o):T(je("write"))}};u$1(Qr,"WritableStreamDefaultWriter");let se=Qr;Object.defineProperties(se.prototype,{abort:{enumerable:!0},close:{enumerable:!0},releaseLock:{enumerable:!0},write:{enumerable:!0},closed:{enumerable:!0},desiredSize:{enumerable:!0},ready:{enumerable:!0}}),w(se.prototype.abort,"abort"),w(se.prototype.close,"close"),w(se.prototype.releaseLock,"releaseLock"),w(se.prototype.write,"write"),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(se.prototype,Symbol.toStringTag,{value:"WritableStreamDefaultWriter",configurable:!0});function Ie(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_ownerWritableStream")?!1:n instanceof se}u$1(Ie,"IsWritableStreamDefaultWriter");function _i(n,o){const a=n._ownerWritableStream;return Ft(a,o)}u$1(_i,"WritableStreamDefaultWriterAbort");function Qn(n){const o=n._ownerWritableStream;return Vn(o)}u$1(Qn,"WritableStreamDefaultWriterClose");function Si(n){const o=n._ownerWritableStream,a=o._state;return be(o)||a==="closed"?k(void 0):a==="errored"?T(o._storedError):Qn(n)}u$1(Si,"WritableStreamDefaultWriterCloseWithErrorPropagation");function wi(n,o){n._closedPromiseState==="pending"?kr(n,o):qi(n,o);}u$1(wi,"WritableStreamDefaultWriterEnsureClosedPromiseRejected");function Gn(n,o){n._readyPromiseState==="pending"?oo(n,o):Wi(n,o);}u$1(Gn,"WritableStreamDefaultWriterEnsureReadyPromiseRejected");function Ri(n){const o=n._ownerWritableStream,a=o._state;return a==="errored"||a==="erroring"?null:a==="closed"?0:Xn(o._writableStreamController)}u$1(Ri,"WritableStreamDefaultWriterGetDesiredSize");function Yn(n){const o=n._ownerWritableStream,a=new TypeError("Writer was released and can no longer be used to monitor the stream's closedness");Gn(n,a),wi(n,a),o._writer=void 0,n._ownerWritableStream=void 0;}u$1(Yn,"WritableStreamDefaultWriterRelease");function Zn(n,o){const a=n._ownerWritableStream,p=a._writableStreamController,g=Pi(p,o);if(a!==n._ownerWritableStream)return T(ct("write to"));const _=a._state;if(_==="errored")return T(a._storedError);if(be(a)||_==="closed")return T(new TypeError("The stream is closing or closed and cannot be written to"));if(_==="erroring")return T(a._storedError);const S=ci(a);return vi(p,o,g),S}u$1(Zn,"WritableStreamDefaultWriterWrite");const Kn={},Gr=class Gr{constructor(){throw new TypeError("Illegal constructor")}get abortReason(){if(!Ar(this))throw qr("abortReason");return this._abortReason}get signal(){if(!Ar(this))throw qr("signal");if(this._abortController===void 0)throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");return this._abortController.signal}error(o=void 0){if(!Ar(this))throw qr("error");this._controlledWritableStream._state==="writable"&&eo(this,o);}[wt](o){const a=this._abortAlgorithm(o);return jt(this),a}[un](){Ae(this);}};u$1(Gr,"WritableStreamDefaultController");let Be=Gr;Object.defineProperties(Be.prototype,{abortReason:{enumerable:!0},signal:{enumerable:!0},error:{enumerable:!0}}),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(Be.prototype,Symbol.toStringTag,{value:"WritableStreamDefaultController",configurable:!0});function Ar(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_controlledWritableStream")?!1:n instanceof Be}u$1(Ar,"IsWritableStreamDefaultController");function Jn(n,o,a,p,g,_,S,C){o._controlledWritableStream=n,n._writableStreamController=o,o._queue=void 0,o._queueTotalSize=void 0,Ae(o),o._abortReason=void 0,o._abortController=li(),o._started=!1,o._strategySizeAlgorithm=C,o._strategyHWM=S,o._writeAlgorithm=p,o._closeAlgorithm=g,o._abortAlgorithm=_;const q=Br(o);Er(n,q);const P=a(),W=k(P);E(W,()=>(o._started=!0,Lt(o),null),O=>(o._started=!0,Cr(n,O),null));}u$1(Jn,"SetUpWritableStreamDefaultController");function Ti(n,o,a,p){const g=Object.create(Be.prototype);let _,S,C,q;o.start!==void 0?_=u$1(()=>o.start(g),"startAlgorithm"):_=u$1(()=>{},"startAlgorithm"),o.write!==void 0?S=u$1(P=>o.write(P,g),"writeAlgorithm"):S=u$1(()=>k(void 0),"writeAlgorithm"),o.close!==void 0?C=u$1(()=>o.close(),"closeAlgorithm"):C=u$1(()=>k(void 0),"closeAlgorithm"),o.abort!==void 0?q=u$1(P=>o.abort(P),"abortAlgorithm"):q=u$1(()=>k(void 0),"abortAlgorithm"),Jn(n,g,_,S,C,q,a,p);}u$1(Ti,"SetUpWritableStreamDefaultControllerFromUnderlyingSink");function jt(n){n._writeAlgorithm=void 0,n._closeAlgorithm=void 0,n._abortAlgorithm=void 0,n._strategySizeAlgorithm=void 0;}u$1(jt,"WritableStreamDefaultControllerClearAlgorithms");function Ci(n){mr(n,Kn,0),Lt(n);}u$1(Ci,"WritableStreamDefaultControllerClose");function Pi(n,o){try{return n._strategySizeAlgorithm(o)}catch(a){return ft(n,a),1}}u$1(Pi,"WritableStreamDefaultControllerGetChunkSize");function Xn(n){return n._strategyHWM-n._queueTotalSize}u$1(Xn,"WritableStreamDefaultControllerGetDesiredSize");function vi(n,o,a){try{mr(n,o,a);}catch(g){ft(n,g);return}const p=n._controlledWritableStream;if(!be(p)&&p._state==="writable"){const g=Br(n);Er(p,g);}Lt(n);}u$1(vi,"WritableStreamDefaultControllerWrite");function Lt(n){const o=n._controlledWritableStream;if(!n._started||o._inFlightWriteRequest!==void 0)return;if(o._state==="erroring"){vr(o);return}if(n._queue.length===0)return;const p=Do(n);p===Kn?Ei(n):Ai(n,p);}u$1(Lt,"WritableStreamDefaultControllerAdvanceQueueIfNeeded");function ft(n,o){n._controlledWritableStream._state==="writable"&&eo(n,o);}u$1(ft,"WritableStreamDefaultControllerErrorIfNeeded");function Ei(n){const o=n._controlledWritableStream;yi(o),br(n);const a=n._closeAlgorithm();jt(n),E(a,()=>(pi(o),null),p=>(bi(o,p),null));}u$1(Ei,"WritableStreamDefaultControllerProcessClose");function Ai(n,o){const a=n._controlledWritableStream;gi(a);const p=n._writeAlgorithm(o);E(p,()=>{di(a);const g=a._state;if(br(n),!be(a)&&g==="writable"){const _=Br(n);Er(a,_);}return Lt(n),null},g=>(a._state==="writable"&&jt(n),hi(a,g),null));}u$1(Ai,"WritableStreamDefaultControllerProcessWrite");function Br(n){return Xn(n)<=0}u$1(Br,"WritableStreamDefaultControllerGetBackpressure");function eo(n,o){const a=n._controlledWritableStream;jt(n),Pr(a,o);}u$1(eo,"WritableStreamDefaultControllerError");function $t(n){return new TypeError(`WritableStream.prototype.${n} can only be used on a WritableStream`)}u$1($t,"streamBrandCheckException$2");function qr(n){return new TypeError(`WritableStreamDefaultController.prototype.${n} can only be used on a WritableStreamDefaultController`)}u$1(qr,"defaultControllerBrandCheckException$2");function je(n){return new TypeError(`WritableStreamDefaultWriter.prototype.${n} can only be used on a WritableStreamDefaultWriter`)}u$1(je,"defaultWriterBrandCheckException");function ct(n){return new TypeError("Cannot "+n+" a stream using a released writer")}u$1(ct,"defaultWriterLockException");function Dt(n){n._closedPromise=F((o,a)=>{n._closedPromise_resolve=o,n._closedPromise_reject=a,n._closedPromiseState="pending";});}u$1(Dt,"defaultWriterClosedPromiseInitialize");function to(n,o){Dt(n),kr(n,o);}u$1(to,"defaultWriterClosedPromiseInitializeAsRejected");function Bi(n){Dt(n),ro(n);}u$1(Bi,"defaultWriterClosedPromiseInitializeAsResolved");function kr(n,o){n._closedPromise_reject!==void 0&&(J(n._closedPromise),n._closedPromise_reject(o),n._closedPromise_resolve=void 0,n._closedPromise_reject=void 0,n._closedPromiseState="rejected");}u$1(kr,"defaultWriterClosedPromiseReject");function qi(n,o){to(n,o);}u$1(qi,"defaultWriterClosedPromiseResetToRejected");function ro(n){n._closedPromise_resolve!==void 0&&(n._closedPromise_resolve(void 0),n._closedPromise_resolve=void 0,n._closedPromise_reject=void 0,n._closedPromiseState="resolved");}u$1(ro,"defaultWriterClosedPromiseResolve");function Mt(n){n._readyPromise=F((o,a)=>{n._readyPromise_resolve=o,n._readyPromise_reject=a;}),n._readyPromiseState="pending";}u$1(Mt,"defaultWriterReadyPromiseInitialize");function Wr(n,o){Mt(n),oo(n,o);}u$1(Wr,"defaultWriterReadyPromiseInitializeAsRejected");function no(n){Mt(n),Or(n);}u$1(no,"defaultWriterReadyPromiseInitializeAsResolved");function oo(n,o){n._readyPromise_reject!==void 0&&(J(n._readyPromise),n._readyPromise_reject(o),n._readyPromise_resolve=void 0,n._readyPromise_reject=void 0,n._readyPromiseState="rejected");}u$1(oo,"defaultWriterReadyPromiseReject");function ki(n){Mt(n);}u$1(ki,"defaultWriterReadyPromiseReset");function Wi(n,o){Wr(n,o);}u$1(Wi,"defaultWriterReadyPromiseResetToRejected");function Or(n){n._readyPromise_resolve!==void 0&&(n._readyPromise_resolve(void 0),n._readyPromise_resolve=void 0,n._readyPromise_reject=void 0,n._readyPromiseState="fulfilled");}u$1(Or,"defaultWriterReadyPromiseResolve");function Oi(){if(typeof globalThis<"u")return globalThis;if(typeof self<"u")return self;if(typeof _commonjsHelpers.commonjsGlobal<"u")return _commonjsHelpers.commonjsGlobal}u$1(Oi,"getGlobals");const zr=Oi();function zi(n){if(!(typeof n=="function"||typeof n=="object")||n.name!=="DOMException")return !1;try{return new n,!0}catch{return !1}}u$1(zi,"isDOMExceptionConstructor");function Fi(){const n=zr?.DOMException;return zi(n)?n:void 0}u$1(Fi,"getFromGlobal");function Ii(){const n=u$1(function(a,p){this.message=a||"",this.name=p||"Error",Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor);},"DOMException");return w(n,"DOMException"),n.prototype=Object.create(Error.prototype),Object.defineProperty(n.prototype,"constructor",{value:n,writable:!0,configurable:!0}),n}u$1(Ii,"createPolyfill");const ji=Fi()||Ii();function io(n,o,a,p,g,_){const S=Ne(n),C=Nn(o);n._disturbed=!0;let q=!1,P=k(void 0);return F((W,O)=>{let j;if(_!==void 0){if(j=u$1(()=>{const A=_.reason!==void 0?_.reason:new ji("Aborted","AbortError"),z=[];p||z.push(()=>o._state==="writable"?Ft(o,A):k(void 0)),g||z.push(()=>n._state==="readable"?le(n,A):k(void 0)),Z(()=>Promise.all(z.map(L=>L())),!0,A);},"abortAlgorithm"),_.aborted){j();return}_.addEventListener("abort",j);}function fe(){return F((A,z)=>{function L(X){X?A():$(et(),L,z);}u$1(L,"next"),L(!1);})}u$1(fe,"pipeLoop");function et(){return q?k(!0):$(C._readyPromise,()=>F((A,z)=>{it(S,{_chunkSteps:L=>{P=$(Zn(C,L),void 0,y),A(!1);},_closeSteps:()=>A(!0),_errorSteps:z});}))}if(u$1(et,"pipeStep"),Te(n,S._closedPromise,A=>(p?re(!0,A):Z(()=>Ft(o,A),!0,A),null)),Te(o,C._closedPromise,A=>(g?re(!0,A):Z(()=>le(n,A),!0,A),null)),Y(n,S._closedPromise,()=>(a?re():Z(()=>Si(C)),null)),be(o)||o._state==="closed"){const A=new TypeError("the destination writable stream closed before all data could be piped to it");g?re(!0,A):Z(()=>le(n,A),!0,A);}J(fe());function We(){const A=P;return $(P,()=>A!==P?We():void 0)}u$1(We,"waitForWritesToFinish");function Te(A,z,L){A._state==="errored"?L(A._storedError):U(z,L);}u$1(Te,"isOrBecomesErrored");function Y(A,z,L){A._state==="closed"?L():K(z,L);}u$1(Y,"isOrBecomesClosed");function Z(A,z,L){if(q)return;q=!0,o._state==="writable"&&!be(o)?K(We(),X):X();function X(){return E(A(),()=>Ce(z,L),tt=>Ce(!0,tt)),null}u$1(X,"doTheRest");}u$1(Z,"shutdownWithAction");function re(A,z){q||(q=!0,o._state==="writable"&&!be(o)?K(We(),()=>Ce(A,z)):Ce(A,z));}u$1(re,"shutdown");function Ce(A,z){return Yn(C),_e(S),_!==void 0&&_.removeEventListener("abort",j),A?O(z):W(void 0),null}u$1(Ce,"finalize");})}u$1(io,"ReadableStreamPipeTo");const Yr=class Yr{constructor(){throw new TypeError("Illegal constructor")}get desiredSize(){if(!xt(this))throw Nt("desiredSize");return Fr(this)}close(){if(!xt(this))throw Nt("close");if(!Ye(this))throw new TypeError("The stream is not in a state that permits close");Le(this);}enqueue(o=void 0){if(!xt(this))throw Nt("enqueue");if(!Ye(this))throw new TypeError("The stream is not in a state that permits enqueue");return Ge(this,o)}error(o=void 0){if(!xt(this))throw Nt("error");ue(this,o);}[er](o){Ae(this);const a=this._cancelAlgorithm(o);return Ut(this),a}[tr](o){const a=this._controlledReadableStream;if(this._queue.length>0){const p=br(this);this._closeRequested&&this._queue.length===0?(Ut(this),pt(a)):dt(this),o._chunkSteps(p);}else bn(a,o),dt(this);}[rr](){}};u$1(Yr,"ReadableStreamDefaultController");let ae=Yr;Object.defineProperties(ae.prototype,{close:{enumerable:!0},enqueue:{enumerable:!0},error:{enumerable:!0},desiredSize:{enumerable:!0}}),w(ae.prototype.close,"close"),w(ae.prototype.enqueue,"enqueue"),w(ae.prototype.error,"error"),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(ae.prototype,Symbol.toStringTag,{value:"ReadableStreamDefaultController",configurable:!0});function xt(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_controlledReadableStream")?!1:n instanceof ae}u$1(xt,"IsReadableStreamDefaultController");function dt(n){if(!so(n))return;if(n._pulling){n._pullAgain=!0;return}n._pulling=!0;const a=n._pullAlgorithm();E(a,()=>(n._pulling=!1,n._pullAgain&&(n._pullAgain=!1,dt(n)),null),p=>(ue(n,p),null));}u$1(dt,"ReadableStreamDefaultControllerCallPullIfNeeded");function so(n){const o=n._controlledReadableStream;return !Ye(n)||!n._started?!1:!!(ke(o)&&Tt(o)>0||Fr(n)>0)}u$1(so,"ReadableStreamDefaultControllerShouldCallPull");function Ut(n){n._pullAlgorithm=void 0,n._cancelAlgorithm=void 0,n._strategySizeAlgorithm=void 0;}u$1(Ut,"ReadableStreamDefaultControllerClearAlgorithms");function Le(n){if(!Ye(n))return;const o=n._controlledReadableStream;n._closeRequested=!0,n._queue.length===0&&(Ut(n),pt(o));}u$1(Le,"ReadableStreamDefaultControllerClose");function Ge(n,o){if(!Ye(n))return;const a=n._controlledReadableStream;if(ke(a)&&Tt(a)>0)fr(a,o,!1);else {let p;try{p=n._strategySizeAlgorithm(o);}catch(g){throw ue(n,g),g}try{mr(n,o,p);}catch(g){throw ue(n,g),g}}dt(n);}u$1(Ge,"ReadableStreamDefaultControllerEnqueue");function ue(n,o){const a=n._controlledReadableStream;a._state==="readable"&&(Ae(n),Ut(n),fo(a,o));}u$1(ue,"ReadableStreamDefaultControllerError");function Fr(n){const o=n._controlledReadableStream._state;return o==="errored"?null:o==="closed"?0:n._strategyHWM-n._queueTotalSize}u$1(Fr,"ReadableStreamDefaultControllerGetDesiredSize");function Li(n){return !so(n)}u$1(Li,"ReadableStreamDefaultControllerHasBackpressure");function Ye(n){const o=n._controlledReadableStream._state;return !n._closeRequested&&o==="readable"}u$1(Ye,"ReadableStreamDefaultControllerCanCloseOrEnqueue");function ao(n,o,a,p,g,_,S){o._controlledReadableStream=n,o._queue=void 0,o._queueTotalSize=void 0,Ae(o),o._started=!1,o._closeRequested=!1,o._pullAgain=!1,o._pulling=!1,o._strategySizeAlgorithm=S,o._strategyHWM=_,o._pullAlgorithm=p,o._cancelAlgorithm=g,n._readableStreamController=o;const C=a();E(k(C),()=>(o._started=!0,dt(o),null),q=>(ue(o,q),null));}u$1(ao,"SetUpReadableStreamDefaultController");function $i(n,o,a,p){const g=Object.create(ae.prototype);let _,S,C;o.start!==void 0?_=u$1(()=>o.start(g),"startAlgorithm"):_=u$1(()=>{},"startAlgorithm"),o.pull!==void 0?S=u$1(()=>o.pull(g),"pullAlgorithm"):S=u$1(()=>k(void 0),"pullAlgorithm"),o.cancel!==void 0?C=u$1(q=>o.cancel(q),"cancelAlgorithm"):C=u$1(()=>k(void 0),"cancelAlgorithm"),ao(n,g,_,S,C,a,p);}u$1($i,"SetUpReadableStreamDefaultControllerFromUnderlyingSource");function Nt(n){return new TypeError(`ReadableStreamDefaultController.prototype.${n} can only be used on a ReadableStreamDefaultController`)}u$1(Nt,"defaultControllerBrandCheckException$1");function Di(n,o){return Oe(n._readableStreamController)?xi(n):Mi(n)}u$1(Di,"ReadableStreamTee");function Mi(n,o){const a=Ne(n);let p=!1,g=!1,_=!1,S=!1,C,q,P,W,O;const j=F(Y=>{O=Y;});function fe(){return p?(g=!0,k(void 0)):(p=!0,it(a,{_chunkSteps:Z=>{ge(()=>{g=!1;const re=Z,Ce=Z;_||Ge(P._readableStreamController,re),S||Ge(W._readableStreamController,Ce),p=!1,g&&fe();});},_closeSteps:()=>{p=!1,_||Le(P._readableStreamController),S||Le(W._readableStreamController),(!_||!S)&&O(void 0);},_errorSteps:()=>{p=!1;}}),k(void 0))}u$1(fe,"pullAlgorithm");function et(Y){if(_=!0,C=Y,S){const Z=st([C,q]),re=le(n,Z);O(re);}return j}u$1(et,"cancel1Algorithm");function We(Y){if(S=!0,q=Y,_){const Z=st([C,q]),re=le(n,Z);O(re);}return j}u$1(We,"cancel2Algorithm");function Te(){}return u$1(Te,"startAlgorithm"),P=ht(Te,fe,et),W=ht(Te,fe,We),U(a._closedPromise,Y=>(ue(P._readableStreamController,Y),ue(W._readableStreamController,Y),(!_||!S)&&O(void 0),null)),[P,W]}u$1(Mi,"ReadableStreamDefaultTee");function xi(n){let o=Ne(n),a=!1,p=!1,g=!1,_=!1,S=!1,C,q,P,W,O;const j=F(A=>{O=A;});function fe(A){U(A._closedPromise,z=>(A!==o||(te(P._readableStreamController,z),te(W._readableStreamController,z),(!_||!S)&&O(void 0)),null));}u$1(fe,"forwardReaderError");function et(){Fe(o)&&(_e(o),o=Ne(n),fe(o)),it(o,{_chunkSteps:z=>{ge(()=>{p=!1,g=!1;const L=z;let X=z;if(!_&&!S)try{X=Pn(z);}catch(tt){te(P._readableStreamController,tt),te(W._readableStreamController,tt),O(le(n,tt));return}_||Bt(P._readableStreamController,L),S||Bt(W._readableStreamController,X),a=!1,p?Te():g&&Y();});},_closeSteps:()=>{a=!1,_||at(P._readableStreamController),S||at(W._readableStreamController),P._readableStreamController._pendingPullIntos.length>0&&qt(P._readableStreamController,0),W._readableStreamController._pendingPullIntos.length>0&&qt(W._readableStreamController,0),(!_||!S)&&O(void 0);},_errorSteps:()=>{a=!1;}});}u$1(et,"pullWithDefaultReader");function We(A,z){ve(o)&&(_e(o),o=Ln(n),fe(o));const L=z?W:P,X=z?P:W;Mn(o,A,1,{_chunkSteps:rt=>{ge(()=>{p=!1,g=!1;const nt=z?S:_;if(z?_:S)nt||kt(L._readableStreamController,rt);else {let Co;try{Co=Pn(rt);}catch(tn){te(L._readableStreamController,tn),te(X._readableStreamController,tn),O(le(n,tn));return}nt||kt(L._readableStreamController,rt),Bt(X._readableStreamController,Co);}a=!1,p?Te():g&&Y();});},_closeSteps:rt=>{a=!1;const nt=z?S:_,Yt=z?_:S;nt||at(L._readableStreamController),Yt||at(X._readableStreamController),rt!==void 0&&(nt||kt(L._readableStreamController,rt),!Yt&&X._readableStreamController._pendingPullIntos.length>0&&qt(X._readableStreamController,0)),(!nt||!Yt)&&O(void 0);},_errorSteps:()=>{a=!1;}});}u$1(We,"pullWithBYOBReader");function Te(){if(a)return p=!0,k(void 0);a=!0;const A=wr(P._readableStreamController);return A===null?et():We(A._view,!1),k(void 0)}u$1(Te,"pull1Algorithm");function Y(){if(a)return g=!0,k(void 0);a=!0;const A=wr(W._readableStreamController);return A===null?et():We(A._view,!0),k(void 0)}u$1(Y,"pull2Algorithm");function Z(A){if(_=!0,C=A,S){const z=st([C,q]),L=le(n,z);O(L);}return j}u$1(Z,"cancel1Algorithm");function re(A){if(S=!0,q=A,_){const z=st([C,q]),L=le(n,z);O(L);}return j}u$1(re,"cancel2Algorithm");function Ce(){}return u$1(Ce,"startAlgorithm"),P=lo(Ce,Te,Z),W=lo(Ce,Y,re),fe(o),[P,W]}u$1(xi,"ReadableByteStreamTee");function Ui(n){return b(n)&&typeof n.getReader<"u"}u$1(Ui,"isReadableStreamLike");function Ni(n){return Ui(n)?Vi(n.getReader()):Hi(n)}u$1(Ni,"ReadableStreamFrom");function Hi(n){let o;const a=Cn(n,"async"),p=y;function g(){let S;try{S=Io(a);}catch(q){return T(q)}const C=k(S);return N(C,q=>{if(!b(q))throw new TypeError("The promise returned by the iterator.next() method must fulfill with an object");if(jo(q))Le(o._readableStreamController);else {const W=Lo(q);Ge(o._readableStreamController,W);}})}u$1(g,"pullAlgorithm");function _(S){const C=a.iterator;let q;try{q=vt(C,"return");}catch(O){return T(O)}if(q===void 0)return k(void 0);let P;try{P=M(q,C,[S]);}catch(O){return T(O)}const W=k(P);return N(W,O=>{if(!b(O))throw new TypeError("The promise returned by the iterator.return() method must fulfill with an object")})}return u$1(_,"cancelAlgorithm"),o=ht(p,g,_,0),o}u$1(Hi,"ReadableStreamFromIterable");function Vi(n){let o;const a=y;function p(){let _;try{_=n.read();}catch(S){return T(S)}return N(_,S=>{if(!b(S))throw new TypeError("The promise returned by the reader.read() method must fulfill with an object");if(S.done)Le(o._readableStreamController);else {const C=S.value;Ge(o._readableStreamController,C);}})}u$1(p,"pullAlgorithm");function g(_){try{return k(n.cancel(_))}catch(S){return T(S)}}return u$1(g,"cancelAlgorithm"),o=ht(a,p,g,0),o}u$1(Vi,"ReadableStreamFromDefaultReader");function Qi(n,o){ce(n,o);const a=n,p=a?.autoAllocateChunkSize,g=a?.cancel,_=a?.pull,S=a?.start,C=a?.type;return {autoAllocateChunkSize:p===void 0?void 0:ur(p,`${o} has member 'autoAllocateChunkSize' that`),cancel:g===void 0?void 0:Gi(g,a,`${o} has member 'cancel' that`),pull:_===void 0?void 0:Yi(_,a,`${o} has member 'pull' that`),start:S===void 0?void 0:Zi(S,a,`${o} has member 'start' that`),type:C===void 0?void 0:Ki(C,`${o} has member 'type' that`)}}u$1(Qi,"convertUnderlyingDefaultOrByteSource");function Gi(n,o,a){return ee(n,a),p=>H(n,o,[p])}u$1(Gi,"convertUnderlyingSourceCancelCallback");function Yi(n,o,a){return ee(n,a),p=>H(n,o,[p])}u$1(Yi,"convertUnderlyingSourcePullCallback");function Zi(n,o,a){return ee(n,a),p=>M(n,o,[p])}u$1(Zi,"convertUnderlyingSourceStartCallback");function Ki(n,o){if(n=`${n}`,n!=="bytes")throw new TypeError(`${o} '${n}' is not a valid enumeration value for ReadableStreamType`);return n}u$1(Ki,"convertReadableStreamType");function Ji(n,o){return ce(n,o),{preventCancel:!!n?.preventCancel}}u$1(Ji,"convertIteratorOptions");function uo(n,o){ce(n,o);const a=n?.preventAbort,p=n?.preventCancel,g=n?.preventClose,_=n?.signal;return _!==void 0&&Xi(_,`${o} has member 'signal' that`),{preventAbort:!!a,preventCancel:!!p,preventClose:!!g,signal:_}}u$1(uo,"convertPipeOptions");function Xi(n,o){if(!ai(n))throw new TypeError(`${o} is not an AbortSignal.`)}u$1(Xi,"assertAbortSignal");function es(n,o){ce(n,o);const a=n?.readable;sr(a,"readable","ReadableWritablePair"),lr(a,`${o} has member 'readable' that`);const p=n?.writable;return sr(p,"writable","ReadableWritablePair"),Un(p,`${o} has member 'writable' that`),{readable:a,writable:p}}u$1(es,"convertReadableWritablePair");const Zr=class Zr{constructor(o={},a={}){o===void 0?o=null:hn(o,"First parameter");const p=zt(a,"Second parameter"),g=Qi(o,"First parameter");if(Ir(this),g.type==="bytes"){if(p.size!==void 0)throw new RangeError("The strategy for a byte stream cannot have a size function");const _=lt(p,0);Go(this,g,_);}else {const _=Ot(p),S=lt(p,1);$i(this,g,S,_);}}get locked(){if(!qe(this))throw $e("locked");return ke(this)}cancel(o=void 0){return qe(this)?ke(this)?T(new TypeError("Cannot cancel a stream that already has a reader")):le(this,o):T($e("cancel"))}getReader(o=void 0){if(!qe(this))throw $e("getReader");return Zo(o,"First parameter").mode===void 0?Ne(this):Ln(this)}pipeThrough(o,a={}){if(!qe(this))throw $e("pipeThrough");Se(o,1,"pipeThrough");const p=es(o,"First parameter"),g=uo(a,"Second parameter");if(ke(this))throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");if(Qe(p.writable))throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");const _=io(this,p.writable,g.preventClose,g.preventAbort,g.preventCancel,g.signal);return J(_),p.readable}pipeTo(o,a={}){if(!qe(this))return T($e("pipeTo"));if(o===void 0)return T("Parameter 1 is required in 'pipeTo'.");if(!Ve(o))return T(new TypeError("ReadableStream.prototype.pipeTo's first argument must be a WritableStream"));let p;try{p=uo(a,"Second parameter");}catch(g){return T(g)}return ke(this)?T(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream")):Qe(o)?T(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream")):io(this,o,p.preventClose,p.preventAbort,p.preventCancel,p.signal)}tee(){if(!qe(this))throw $e("tee");const o=Di(this);return st(o)}values(o=void 0){if(!qe(this))throw $e("values");const a=Ji(o,"First parameter");return zo(this,a.preventCancel)}[pr](o){return this.values(o)}static from(o){return Ni(o)}};u$1(Zr,"ReadableStream");let V=Zr;Object.defineProperties(V,{from:{enumerable:!0}}),Object.defineProperties(V.prototype,{cancel:{enumerable:!0},getReader:{enumerable:!0},pipeThrough:{enumerable:!0},pipeTo:{enumerable:!0},tee:{enumerable:!0},values:{enumerable:!0},locked:{enumerable:!0}}),w(V.from,"from"),w(V.prototype.cancel,"cancel"),w(V.prototype.getReader,"getReader"),w(V.prototype.pipeThrough,"pipeThrough"),w(V.prototype.pipeTo,"pipeTo"),w(V.prototype.tee,"tee"),w(V.prototype.values,"values"),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(V.prototype,Symbol.toStringTag,{value:"ReadableStream",configurable:!0}),Object.defineProperty(V.prototype,pr,{value:V.prototype.values,writable:!0,configurable:!0});function ht(n,o,a,p=1,g=()=>1){const _=Object.create(V.prototype);Ir(_);const S=Object.create(ae.prototype);return ao(_,S,n,o,a,p,g),_}u$1(ht,"CreateReadableStream");function lo(n,o,a){const p=Object.create(V.prototype);Ir(p);const g=Object.create(ie.prototype);return jn(p,g,n,o,a,0,void 0),p}u$1(lo,"CreateReadableByteStream");function Ir(n){n._state="readable",n._reader=void 0,n._storedError=void 0,n._disturbed=!1;}u$1(Ir,"InitializeReadableStream");function qe(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_readableStreamController")?!1:n instanceof V}u$1(qe,"IsReadableStream");function ke(n){return n._reader!==void 0}u$1(ke,"IsReadableStreamLocked");function le(n,o){if(n._disturbed=!0,n._state==="closed")return k(void 0);if(n._state==="errored")return T(n._storedError);pt(n);const a=n._reader;if(a!==void 0&&Fe(a)){const g=a._readIntoRequests;a._readIntoRequests=new Q,g.forEach(_=>{_._closeSteps(void 0);});}const p=n._readableStreamController[er](o);return N(p,y)}u$1(le,"ReadableStreamCancel");function pt(n){n._state="closed";const o=n._reader;if(o!==void 0&&(cn(o),ve(o))){const a=o._readRequests;o._readRequests=new Q,a.forEach(p=>{p._closeSteps();});}}u$1(pt,"ReadableStreamClose");function fo(n,o){n._state="errored",n._storedError=o;const a=n._reader;a!==void 0&&(ir(a,o),ve(a)?yn(a,o):xn(a,o));}u$1(fo,"ReadableStreamError");function $e(n){return new TypeError(`ReadableStream.prototype.${n} can only be used on a ReadableStream`)}u$1($e,"streamBrandCheckException$1");function co(n,o){ce(n,o);const a=n?.highWaterMark;return sr(a,"highWaterMark","QueuingStrategyInit"),{highWaterMark:ar(a)}}u$1(co,"convertQueuingStrategyInit");const ho=u$1(n=>n.byteLength,"byteLengthSizeFunction");w(ho,"size");const Kr=class Kr{constructor(o){Se(o,1,"ByteLengthQueuingStrategy"),o=co(o,"First parameter"),this._byteLengthQueuingStrategyHighWaterMark=o.highWaterMark;}get highWaterMark(){if(!bo(this))throw po("highWaterMark");return this._byteLengthQueuingStrategyHighWaterMark}get size(){if(!bo(this))throw po("size");return ho}};u$1(Kr,"ByteLengthQueuingStrategy");let Ze=Kr;Object.defineProperties(Ze.prototype,{highWaterMark:{enumerable:!0},size:{enumerable:!0}}),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(Ze.prototype,Symbol.toStringTag,{value:"ByteLengthQueuingStrategy",configurable:!0});function po(n){return new TypeError(`ByteLengthQueuingStrategy.prototype.${n} can only be used on a ByteLengthQueuingStrategy`)}u$1(po,"byteLengthBrandCheckException");function bo(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_byteLengthQueuingStrategyHighWaterMark")?!1:n instanceof Ze}u$1(bo,"IsByteLengthQueuingStrategy");const mo=u$1(()=>1,"countSizeFunction");w(mo,"size");const Jr=class Jr{constructor(o){Se(o,1,"CountQueuingStrategy"),o=co(o,"First parameter"),this._countQueuingStrategyHighWaterMark=o.highWaterMark;}get highWaterMark(){if(!go(this))throw yo("highWaterMark");return this._countQueuingStrategyHighWaterMark}get size(){if(!go(this))throw yo("size");return mo}};u$1(Jr,"CountQueuingStrategy");let Ke=Jr;Object.defineProperties(Ke.prototype,{highWaterMark:{enumerable:!0},size:{enumerable:!0}}),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(Ke.prototype,Symbol.toStringTag,{value:"CountQueuingStrategy",configurable:!0});function yo(n){return new TypeError(`CountQueuingStrategy.prototype.${n} can only be used on a CountQueuingStrategy`)}u$1(yo,"countBrandCheckException");function go(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_countQueuingStrategyHighWaterMark")?!1:n instanceof Ke}u$1(go,"IsCountQueuingStrategy");function ts(n,o){ce(n,o);const a=n?.cancel,p=n?.flush,g=n?.readableType,_=n?.start,S=n?.transform,C=n?.writableType;return {cancel:a===void 0?void 0:is(a,n,`${o} has member 'cancel' that`),flush:p===void 0?void 0:rs(p,n,`${o} has member 'flush' that`),readableType:g,start:_===void 0?void 0:ns(_,n,`${o} has member 'start' that`),transform:S===void 0?void 0:os(S,n,`${o} has member 'transform' that`),writableType:C}}u$1(ts,"convertTransformer");function rs(n,o,a){return ee(n,a),p=>H(n,o,[p])}u$1(rs,"convertTransformerFlushCallback");function ns(n,o,a){return ee(n,a),p=>M(n,o,[p])}u$1(ns,"convertTransformerStartCallback");function os(n,o,a){return ee(n,a),(p,g)=>H(n,o,[p,g])}u$1(os,"convertTransformerTransformCallback");function is(n,o,a){return ee(n,a),p=>H(n,o,[p])}u$1(is,"convertTransformerCancelCallback");const Xr=class Xr{constructor(o={},a={},p={}){o===void 0&&(o=null);const g=zt(a,"Second parameter"),_=zt(p,"Third parameter"),S=ts(o,"First parameter");if(S.readableType!==void 0)throw new RangeError("Invalid readableType specified");if(S.writableType!==void 0)throw new RangeError("Invalid writableType specified");const C=lt(_,0),q=Ot(_),P=lt(g,1),W=Ot(g);let O;const j=F(fe=>{O=fe;});ss(this,j,P,W,C,q),us(this,S),S.start!==void 0?O(S.start(this._transformStreamController)):O(void 0);}get readable(){if(!_o(this))throw To("readable");return this._readable}get writable(){if(!_o(this))throw To("writable");return this._writable}};u$1(Xr,"TransformStream");let Je=Xr;Object.defineProperties(Je.prototype,{readable:{enumerable:!0},writable:{enumerable:!0}}),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(Je.prototype,Symbol.toStringTag,{value:"TransformStream",configurable:!0});function ss(n,o,a,p,g,_){function S(){return o}u$1(S,"startAlgorithm");function C(j){return cs(n,j)}u$1(C,"writeAlgorithm");function q(j){return ds(n,j)}u$1(q,"abortAlgorithm");function P(){return hs(n)}u$1(P,"closeAlgorithm"),n._writable=fi(S,C,P,q,a,p);function W(){return ps(n)}u$1(W,"pullAlgorithm");function O(j){return bs(n,j)}u$1(O,"cancelAlgorithm"),n._readable=ht(S,W,O,g,_),n._backpressure=void 0,n._backpressureChangePromise=void 0,n._backpressureChangePromise_resolve=void 0,Ht(n,!0),n._transformStreamController=void 0;}u$1(ss,"InitializeTransformStream");function _o(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_transformStreamController")?!1:n instanceof Je}u$1(_o,"IsTransformStream");function So(n,o){ue(n._readable._readableStreamController,o),jr(n,o);}u$1(So,"TransformStreamError");function jr(n,o){Qt(n._transformStreamController),ft(n._writable._writableStreamController,o),Lr(n);}u$1(jr,"TransformStreamErrorWritableAndUnblockWrite");function Lr(n){n._backpressure&&Ht(n,!1);}u$1(Lr,"TransformStreamUnblockWrite");function Ht(n,o){n._backpressureChangePromise!==void 0&&n._backpressureChangePromise_resolve(),n._backpressureChangePromise=F(a=>{n._backpressureChangePromise_resolve=a;}),n._backpressure=o;}u$1(Ht,"TransformStreamSetBackpressure");const en=class en{constructor(){throw new TypeError("Illegal constructor")}get desiredSize(){if(!Vt(this))throw Gt("desiredSize");const o=this._controlledTransformStream._readable._readableStreamController;return Fr(o)}enqueue(o=void 0){if(!Vt(this))throw Gt("enqueue");wo(this,o);}error(o=void 0){if(!Vt(this))throw Gt("error");ls(this,o);}terminate(){if(!Vt(this))throw Gt("terminate");fs(this);}};u$1(en,"TransformStreamDefaultController");let me=en;Object.defineProperties(me.prototype,{enqueue:{enumerable:!0},error:{enumerable:!0},terminate:{enumerable:!0},desiredSize:{enumerable:!0}}),w(me.prototype.enqueue,"enqueue"),w(me.prototype.error,"error"),w(me.prototype.terminate,"terminate"),typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(me.prototype,Symbol.toStringTag,{value:"TransformStreamDefaultController",configurable:!0});function Vt(n){return !b(n)||!Object.prototype.hasOwnProperty.call(n,"_controlledTransformStream")?!1:n instanceof me}u$1(Vt,"IsTransformStreamDefaultController");function as(n,o,a,p,g){o._controlledTransformStream=n,n._transformStreamController=o,o._transformAlgorithm=a,o._flushAlgorithm=p,o._cancelAlgorithm=g,o._finishPromise=void 0,o._finishPromise_resolve=void 0,o._finishPromise_reject=void 0;}u$1(as,"SetUpTransformStreamDefaultController");function us(n,o){const a=Object.create(me.prototype);let p,g,_;o.transform!==void 0?p=u$1(S=>o.transform(S,a),"transformAlgorithm"):p=u$1(S=>{try{return wo(a,S),k(void 0)}catch(C){return T(C)}},"transformAlgorithm"),o.flush!==void 0?g=u$1(()=>o.flush(a),"flushAlgorithm"):g=u$1(()=>k(void 0),"flushAlgorithm"),o.cancel!==void 0?_=u$1(S=>o.cancel(S),"cancelAlgorithm"):_=u$1(()=>k(void 0),"cancelAlgorithm"),as(n,a,p,g,_);}u$1(us,"SetUpTransformStreamDefaultControllerFromTransformer");function Qt(n){n._transformAlgorithm=void 0,n._flushAlgorithm=void 0,n._cancelAlgorithm=void 0;}u$1(Qt,"TransformStreamDefaultControllerClearAlgorithms");function wo(n,o){const a=n._controlledTransformStream,p=a._readable._readableStreamController;if(!Ye(p))throw new TypeError("Readable side is not in a state that permits enqueue");try{Ge(p,o);}catch(_){throw jr(a,_),a._readable._storedError}Li(p)!==a._backpressure&&Ht(a,!0);}u$1(wo,"TransformStreamDefaultControllerEnqueue");function ls(n,o){So(n._controlledTransformStream,o);}u$1(ls,"TransformStreamDefaultControllerError");function Ro(n,o){const a=n._transformAlgorithm(o);return N(a,void 0,p=>{throw So(n._controlledTransformStream,p),p})}u$1(Ro,"TransformStreamDefaultControllerPerformTransform");function fs(n){const o=n._controlledTransformStream,a=o._readable._readableStreamController;Le(a);const p=new TypeError("TransformStream terminated");jr(o,p);}u$1(fs,"TransformStreamDefaultControllerTerminate");function cs(n,o){const a=n._transformStreamController;if(n._backpressure){const p=n._backpressureChangePromise;return N(p,()=>{const g=n._writable;if(g._state==="erroring")throw g._storedError;return Ro(a,o)})}return Ro(a,o)}u$1(cs,"TransformStreamDefaultSinkWriteAlgorithm");function ds(n,o){const a=n._transformStreamController;if(a._finishPromise!==void 0)return a._finishPromise;const p=n._readable;a._finishPromise=F((_,S)=>{a._finishPromise_resolve=_,a._finishPromise_reject=S;});const g=a._cancelAlgorithm(o);return Qt(a),E(g,()=>(p._state==="errored"?Xe(a,p._storedError):(ue(p._readableStreamController,o),$r(a)),null),_=>(ue(p._readableStreamController,_),Xe(a,_),null)),a._finishPromise}u$1(ds,"TransformStreamDefaultSinkAbortAlgorithm");function hs(n){const o=n._transformStreamController;if(o._finishPromise!==void 0)return o._finishPromise;const a=n._readable;o._finishPromise=F((g,_)=>{o._finishPromise_resolve=g,o._finishPromise_reject=_;});const p=o._flushAlgorithm();return Qt(o),E(p,()=>(a._state==="errored"?Xe(o,a._storedError):(Le(a._readableStreamController),$r(o)),null),g=>(ue(a._readableStreamController,g),Xe(o,g),null)),o._finishPromise}u$1(hs,"TransformStreamDefaultSinkCloseAlgorithm");function ps(n){return Ht(n,!1),n._backpressureChangePromise}u$1(ps,"TransformStreamDefaultSourcePullAlgorithm");function bs(n,o){const a=n._transformStreamController;if(a._finishPromise!==void 0)return a._finishPromise;const p=n._writable;a._finishPromise=F((_,S)=>{a._finishPromise_resolve=_,a._finishPromise_reject=S;});const g=a._cancelAlgorithm(o);return Qt(a),E(g,()=>(p._state==="errored"?Xe(a,p._storedError):(ft(p._writableStreamController,o),Lr(n),$r(a)),null),_=>(ft(p._writableStreamController,_),Lr(n),Xe(a,_),null)),a._finishPromise}u$1(bs,"TransformStreamDefaultSourceCancelAlgorithm");function Gt(n){return new TypeError(`TransformStreamDefaultController.prototype.${n} can only be used on a TransformStreamDefaultController`)}u$1(Gt,"defaultControllerBrandCheckException");function $r(n){n._finishPromise_resolve!==void 0&&(n._finishPromise_resolve(),n._finishPromise_resolve=void 0,n._finishPromise_reject=void 0);}u$1($r,"defaultControllerFinishPromiseResolve");function Xe(n,o){n._finishPromise_reject!==void 0&&(J(n._finishPromise),n._finishPromise_reject(o),n._finishPromise_resolve=void 0,n._finishPromise_reject=void 0);}u$1(Xe,"defaultControllerFinishPromiseReject");function To(n){return new TypeError(`TransformStream.prototype.${n} can only be used on a TransformStream`)}u$1(To,"streamBrandCheckException"),d.ByteLengthQueuingStrategy=Ze,d.CountQueuingStrategy=Ke,d.ReadableByteStreamController=ie,d.ReadableStream=V,d.ReadableStreamBYOBReader=he,d.ReadableStreamBYOBRequest=Re,d.ReadableStreamDefaultController=ae,d.ReadableStreamDefaultReader=de,d.TransformStream=Je,d.TransformStreamDefaultController=me,d.WritableStream=pe,d.WritableStreamDefaultController=Be,d.WritableStreamDefaultWriter=se;});}(ponyfill_es2018,ponyfill_es2018.exports)),ponyfill_es2018.exports}u$1(requirePonyfill_es2018,"requirePonyfill_es2018");const POOL_SIZE$1=65536;if(!globalThis.ReadableStream)try{const c=require("node:process"),{emitWarning:l}=c;try{c.emitWarning=()=>{},Object.assign(globalThis,require("node:stream/web")),c.emitWarning=l;}catch(d){throw c.emitWarning=l,d}}catch{Object.assign(globalThis,requirePonyfill_es2018());}try{const{Blob:c}=require("buffer");c&&!c.prototype.stream&&(c.prototype.stream=u$1(function(d){let y=0;const b=this;return new ReadableStream({type:"bytes",async pull(R){const v=await b.slice(y,Math.min(b.size,y+POOL_SIZE$1)).arrayBuffer();y+=v.byteLength,R.enqueue(new Uint8Array(v)),y===b.size&&R.close();}})},"name"));}catch{}/*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */const POOL_SIZE=65536;async function*toIterator(c,l=!0){for(const d of c)if("stream"in d)yield*d.stream();else if(ArrayBuffer.isView(d))if(l){let y=d.byteOffset;const b=d.byteOffset+d.byteLength;for(;y!==b;){const R=Math.min(b-y,POOL_SIZE),w=d.buffer.slice(y,y+R);y+=w.byteLength,yield new Uint8Array(w);}}else yield d;else {let y=0,b=d;for(;y!==b.size;){const w=await b.slice(y,Math.min(b.size,y+POOL_SIZE)).arrayBuffer();y+=w.byteLength,yield new Uint8Array(w);}}}u$1(toIterator,"toIterator");const _Blob=(Ue$2=class{constructor(l=[],d={}){ye$1(this,Pe$1,[]);ye$1(this,bt$2,"");ye$1(this,ot$2,0);ye$1(this,Zt$2,"transparent");if(typeof l!="object"||l===null)throw new TypeError("Failed to construct 'Blob': The provided value cannot be converted to a sequence.");if(typeof l[Symbol.iterator]!="function")throw new TypeError("Failed to construct 'Blob': The object must have a callable @@iterator property.");if(typeof d!="object"&&typeof d!="function")throw new TypeError("Failed to construct 'Blob': parameter 2 cannot convert to dictionary.");d===null&&(d={});const y=new TextEncoder;for(const R of l){let w;ArrayBuffer.isView(R)?w=new Uint8Array(R.buffer.slice(R.byteOffset,R.byteOffset+R.byteLength)):R instanceof ArrayBuffer?w=new Uint8Array(R.slice(0)):R instanceof Ue$2?w=R:w=y.encode(`${R}`),ne$3(this,ot$2,D$4(this,ot$2)+(ArrayBuffer.isView(w)?w.byteLength:w.size)),D$4(this,Pe$1).push(w);}ne$3(this,Zt$2,`${d.endings===void 0?"transparent":d.endings}`);const b=d.type===void 0?"":String(d.type);ne$3(this,bt$2,/^[\x20-\x7E]*$/.test(b)?b:"");}get size(){return D$4(this,ot$2)}get type(){return D$4(this,bt$2)}async text(){const l=new TextDecoder;let d="";for await(const y of toIterator(D$4(this,Pe$1),!1))d+=l.decode(y,{stream:!0});return d+=l.decode(),d}async arrayBuffer(){const l=new Uint8Array(this.size);let d=0;for await(const y of toIterator(D$4(this,Pe$1),!1))l.set(y,d),d+=y.length;return l.buffer}stream(){const l=toIterator(D$4(this,Pe$1),!0);return new globalThis.ReadableStream({type:"bytes",async pull(d){const y=await l.next();y.done?d.close():d.enqueue(y.value);},async cancel(){await l.return();}})}slice(l=0,d=this.size,y=""){const{size:b}=this;let R=l<0?Math.max(b+l,0):Math.min(l,b),w=d<0?Math.max(b+d,0):Math.min(d,b);const v=Math.max(w-R,0),I=D$4(this,Pe$1),B=[];let F=0;for(const T of I){if(F>=v)break;const $=ArrayBuffer.isView(T)?T.byteLength:T.size;if(R&&$<=R)R-=$,w-=$;else {let E;ArrayBuffer.isView(T)?(E=T.subarray(R,Math.min($,w)),F+=E.byteLength):(E=T.slice(R,Math.min($,w)),F+=E.size),w-=$,B.push(E),R=0;}}const k=new Ue$2([],{type:String(y).toLowerCase()});return ne$3(k,ot$2,v),ne$3(k,Pe$1,B),k}get[Symbol.toStringTag](){return "Blob"}static[Symbol.hasInstance](l){return l&&typeof l=="object"&&typeof l.constructor=="function"&&(typeof l.stream=="function"||typeof l.arrayBuffer=="function")&&/^(Blob|File)$/.test(l[Symbol.toStringTag])}},Pe$1=new WeakMap,bt$2=new WeakMap,ot$2=new WeakMap,Zt$2=new WeakMap,u$1(Ue$2,"Blob"),Ue$2);Object.defineProperties(_Blob.prototype,{size:{enumerable:!0},type:{enumerable:!0},slice:{enumerable:!0}});const Blob=_Blob,r$1=Blob,_File=(gt$2=class extends r$1{constructor(d,y,b={}){if(arguments.length<2)throw new TypeError(`Failed to construct 'File': 2 arguments required, but only ${arguments.length} present.`);super(d,b);ye$1(this,mt$2,0);ye$1(this,yt$2,"");b===null&&(b={});const R=b.lastModified===void 0?Date.now():Number(b.lastModified);Number.isNaN(R)||ne$3(this,mt$2,R),ne$3(this,yt$2,String(y));}get name(){return D$4(this,yt$2)}get lastModified(){return D$4(this,mt$2)}get[Symbol.toStringTag](){return "File"}static[Symbol.hasInstance](d){return !!d&&d instanceof r$1&&/^(File)$/.test(d[Symbol.toStringTag])}},mt$2=new WeakMap,yt$2=new WeakMap,u$1(gt$2,"File"),gt$2),File=_File,File$1=File;/*! formdata-polyfill. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */var{toStringTag:t$1,iterator:i$2,hasInstance:h$2}=Symbol,r$2=Math.random,m$2="append,set,get,getAll,delete,keys,values,entries,forEach,constructor".split(","),f$1=u$1((c,l,d)=>(c+="",/^(Blob|File)$/.test(l&&l[t$1])?[(d=d!==void 0?d+"":l[t$1]=="File"?l.name:"blob",c),l.name!==d||l[t$1]=="blob"?new File$1([l],d,l):l]:[c,l+""]),"f"),e$1=u$1((c,l)=>(l?c:c.replace(/\r?\n|\r/g,`\r
`)).replace(/\n/g,"%0A").replace(/\r/g,"%0D").replace(/"/g,"%22"),"e$1"),x$1=u$1((c,l,d)=>{if(l.length<d)throw new TypeError(`Failed to execute '${c}' on 'FormData': ${d} arguments required, but only ${l.length} present.`)},"x");const FormData=(_t$2=class{constructor(...l){ye$1(this,oe$2,[]);if(l.length)throw new TypeError("Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'.")}get[t$1](){return "FormData"}[i$2](){return this.entries()}static[h$2](l){return l&&typeof l=="object"&&l[t$1]==="FormData"&&!m$2.some(d=>typeof l[d]!="function")}append(...l){x$1("append",arguments,2),D$4(this,oe$2).push(f$1(...l));}delete(l){x$1("delete",arguments,1),l+="",ne$3(this,oe$2,D$4(this,oe$2).filter(([d])=>d!==l));}get(l){x$1("get",arguments,1),l+="";for(var d=D$4(this,oe$2),y=d.length,b=0;b<y;b++)if(d[b][0]===l)return d[b][1];return null}getAll(l,d){return x$1("getAll",arguments,1),d=[],l+="",D$4(this,oe$2).forEach(y=>y[0]===l&&d.push(y[1])),d}has(l){return x$1("has",arguments,1),l+="",D$4(this,oe$2).some(d=>d[0]===l)}forEach(l,d){x$1("forEach",arguments,1);for(var[y,b]of this)l.call(d,b,y,this);}set(...l){x$1("set",arguments,2);var d=[],y=!0;l=f$1(...l),D$4(this,oe$2).forEach(b=>{b[0]===l[0]?y&&(y=!d.push(l)):d.push(b);}),y&&d.push(l),ne$3(this,oe$2,d);}*entries(){yield*D$4(this,oe$2);}*keys(){for(var[l]of this)yield l;}*values(){for(var[,l]of this)yield l;}},oe$2=new WeakMap,u$1(_t$2,"FormData"),_t$2);function formDataToBlob(c,l=r$1){var d=`${r$2()}${r$2()}`.replace(/\./g,"").slice(-28).padStart(32,"-"),y=[],b=`--${d}\r
Content-Disposition: form-data; name="`;return c.forEach((R,w)=>typeof R=="string"?y.push(b+e$1(w)+`"\r
\r
${R.replace(/\r(?!\n)|(?<!\r)\n/g,`\r
`)}\r
`):y.push(b+e$1(w)+`"; filename="${e$1(R.name,1)}"\r
Content-Type: ${R.type||"application/octet-stream"}\r
\r
`,R,`\r
`)),y.push(`--${d}--`),new l(y,{type:"multipart/form-data; boundary="+d})}u$1(formDataToBlob,"formDataToBlob");const rn$1=class rn extends Error{constructor(l,d){super(l),Error.captureStackTrace(this,this.constructor),this.type=d;}get name(){return this.constructor.name}get[Symbol.toStringTag](){return this.constructor.name}};u$1(rn$1,"FetchBaseError");let FetchBaseError=rn$1;const nn$1=class nn extends FetchBaseError{constructor(l,d,y){super(l,d),y&&(this.code=this.errno=y.code,this.erroredSysCall=y.syscall);}};u$1(nn$1,"FetchError");let FetchError$1=nn$1;const NAME=Symbol.toStringTag,isURLSearchParameters=u$1(c=>typeof c=="object"&&typeof c.append=="function"&&typeof c.delete=="function"&&typeof c.get=="function"&&typeof c.getAll=="function"&&typeof c.has=="function"&&typeof c.set=="function"&&typeof c.sort=="function"&&c[NAME]==="URLSearchParams","isURLSearchParameters"),isBlob=u$1(c=>c&&typeof c=="object"&&typeof c.arrayBuffer=="function"&&typeof c.type=="string"&&typeof c.stream=="function"&&typeof c.constructor=="function"&&/^(Blob|File)$/.test(c[NAME]),"isBlob"),isAbortSignal=u$1(c=>typeof c=="object"&&(c[NAME]==="AbortSignal"||c[NAME]==="EventTarget"),"isAbortSignal"),isDomainOrSubdomain=u$1((c,l)=>{const d=new URL(l).hostname,y=new URL(c).hostname;return d===y||d.endsWith(`.${y}`)},"isDomainOrSubdomain"),isSameProtocol=u$1((c,l)=>{const d=new URL(l).protocol,y=new URL(c).protocol;return d===y},"isSameProtocol"),pipeline=require$$0.promisify(Stream__default.pipeline),INTERNALS$2=Symbol("Body internals"),on$1=class on{constructor(l,{size:d=0}={}){let y=null;l===null?l=null:isURLSearchParameters(l)?l=require$$6.Buffer.from(l.toString()):isBlob(l)||require$$6.Buffer.isBuffer(l)||(require$$0.types.isAnyArrayBuffer(l)?l=require$$6.Buffer.from(l):ArrayBuffer.isView(l)?l=require$$6.Buffer.from(l.buffer,l.byteOffset,l.byteLength):l instanceof Stream__default||(l instanceof FormData?(l=formDataToBlob(l),y=l.type.split("=")[1]):l=require$$6.Buffer.from(String(l))));let b=l;require$$6.Buffer.isBuffer(l)?b=Stream__default.Readable.from(l):isBlob(l)&&(b=Stream__default.Readable.from(l.stream())),this[INTERNALS$2]={body:l,stream:b,boundary:y,disturbed:!1,error:null},this.size=d,l instanceof Stream__default&&l.on("error",R=>{const w=R instanceof FetchBaseError?R:new FetchError$1(`Invalid response body while trying to fetch ${this.url}: ${R.message}`,"system",R);this[INTERNALS$2].error=w;});}get body(){return this[INTERNALS$2].stream}get bodyUsed(){return this[INTERNALS$2].disturbed}async arrayBuffer(){const{buffer:l,byteOffset:d,byteLength:y}=await consumeBody(this);return l.slice(d,d+y)}async formData(){const l=this.headers.get("content-type");if(l.startsWith("application/x-www-form-urlencoded")){const y=new FormData,b=new URLSearchParams(await this.text());for(const[R,w]of b)y.append(R,w);return y}const{toFormData:d}=await import('./_/multipart-parser.mjs').then(function (n) { return n.m; });return d(this.body,l)}async blob(){const l=this.headers&&this.headers.get("content-type")||this[INTERNALS$2].body&&this[INTERNALS$2].body.type||"",d=await this.arrayBuffer();return new r$1([d],{type:l})}async json(){const l=await this.text();return JSON.parse(l)}async text(){const l=await consumeBody(this);return new TextDecoder().decode(l)}buffer(){return consumeBody(this)}};u$1(on$1,"Body");let Body=on$1;Body.prototype.buffer=require$$0.deprecate(Body.prototype.buffer,"Please use 'response.arrayBuffer()' instead of 'response.buffer()'","node-fetch#buffer"),Object.defineProperties(Body.prototype,{body:{enumerable:!0},bodyUsed:{enumerable:!0},arrayBuffer:{enumerable:!0},blob:{enumerable:!0},json:{enumerable:!0},text:{enumerable:!0},data:{get:require$$0.deprecate(()=>{},"data doesn't exist, use json(), text(), arrayBuffer(), or body instead","https://github.com/node-fetch/node-fetch/issues/1000 (response)")}});async function consumeBody(c){if(c[INTERNALS$2].disturbed)throw new TypeError(`body used already for: ${c.url}`);if(c[INTERNALS$2].disturbed=!0,c[INTERNALS$2].error)throw c[INTERNALS$2].error;const{body:l}=c;if(l===null||!(l instanceof Stream__default))return require$$6.Buffer.alloc(0);const d=[];let y=0;try{for await(const b of l){if(c.size>0&&y+b.length>c.size){const R=new FetchError$1(`content size at ${c.url} over limit: ${c.size}`,"max-size");throw l.destroy(R),R}y+=b.length,d.push(b);}}catch(b){throw b instanceof FetchBaseError?b:new FetchError$1(`Invalid response body while trying to fetch ${c.url}: ${b.message}`,"system",b)}if(l.readableEnded===!0||l._readableState.ended===!0)try{return d.every(b=>typeof b=="string")?require$$6.Buffer.from(d.join("")):require$$6.Buffer.concat(d,y)}catch(b){throw new FetchError$1(`Could not create Buffer from response body for ${c.url}: ${b.message}`,"system",b)}else throw new FetchError$1(`Premature close of server response while trying to fetch ${c.url}`)}u$1(consumeBody,"consumeBody");const clone=u$1((c,l)=>{let d,y,{body:b}=c[INTERNALS$2];if(c.bodyUsed)throw new Error("cannot clone body after it is used");return b instanceof Stream__default&&typeof b.getBoundary!="function"&&(d=new Stream.PassThrough({highWaterMark:l}),y=new Stream.PassThrough({highWaterMark:l}),b.pipe(d),b.pipe(y),c[INTERNALS$2].stream=d,b=y),b},"clone"),getNonSpecFormDataBoundary=require$$0.deprecate(c=>c.getBoundary(),"form-data doesn't follow the spec and requires special treatment. Use alternative package","https://github.com/node-fetch/node-fetch/issues/1167"),extractContentType=u$1((c,l)=>c===null?null:typeof c=="string"?"text/plain;charset=UTF-8":isURLSearchParameters(c)?"application/x-www-form-urlencoded;charset=UTF-8":isBlob(c)?c.type||null:require$$6.Buffer.isBuffer(c)||require$$0.types.isAnyArrayBuffer(c)||ArrayBuffer.isView(c)?null:c instanceof FormData?`multipart/form-data; boundary=${l[INTERNALS$2].boundary}`:c&&typeof c.getBoundary=="function"?`multipart/form-data;boundary=${getNonSpecFormDataBoundary(c)}`:c instanceof Stream__default?null:"text/plain;charset=UTF-8","extractContentType"),getTotalBytes=u$1(c=>{const{body:l}=c[INTERNALS$2];return l===null?0:isBlob(l)?l.size:require$$6.Buffer.isBuffer(l)?l.length:l&&typeof l.getLengthSync=="function"&&l.hasKnownLength&&l.hasKnownLength()?l.getLengthSync():null},"getTotalBytes"),writeToStream=u$1(async(c,{body:l})=>{l===null?c.end():await pipeline(l,c);},"writeToStream"),validateHeaderName=typeof http__default.validateHeaderName=="function"?http__default.validateHeaderName:c=>{if(!/^[\^`\-\w!#$%&'*+.|~]+$/.test(c)){const l=new TypeError(`Header name must be a valid HTTP token [${c}]`);throw Object.defineProperty(l,"code",{value:"ERR_INVALID_HTTP_TOKEN"}),l}},validateHeaderValue=typeof http__default.validateHeaderValue=="function"?http__default.validateHeaderValue:(c,l)=>{if(/[^\t\u0020-\u007E\u0080-\u00FF]/.test(l)){const d=new TypeError(`Invalid character in header content ["${c}"]`);throw Object.defineProperty(d,"code",{value:"ERR_INVALID_CHAR"}),d}},Kt$2=class Kt extends URLSearchParams{constructor(l){let d=[];if(l instanceof Kt){const y=l.raw();for(const[b,R]of Object.entries(y))d.push(...R.map(w=>[b,w]));}else if(l!=null)if(typeof l=="object"&&!require$$0.types.isBoxedPrimitive(l)){const y=l[Symbol.iterator];if(y==null)d.push(...Object.entries(l));else {if(typeof y!="function")throw new TypeError("Header pairs must be iterable");d=[...l].map(b=>{if(typeof b!="object"||require$$0.types.isBoxedPrimitive(b))throw new TypeError("Each header pair must be an iterable object");return [...b]}).map(b=>{if(b.length!==2)throw new TypeError("Each header pair must be a name/value tuple");return [...b]});}}else throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");return d=d.length>0?d.map(([y,b])=>(validateHeaderName(y),validateHeaderValue(y,String(b)),[String(y).toLowerCase(),String(b)])):void 0,super(d),new Proxy(this,{get(y,b,R){switch(b){case"append":case"set":return (w,v)=>(validateHeaderName(w),validateHeaderValue(w,String(v)),URLSearchParams.prototype[b].call(y,String(w).toLowerCase(),String(v)));case"delete":case"has":case"getAll":return w=>(validateHeaderName(w),URLSearchParams.prototype[b].call(y,String(w).toLowerCase()));case"keys":return ()=>(y.sort(),new Set(URLSearchParams.prototype.keys.call(y)).keys());default:return Reflect.get(y,b,R)}}})}get[Symbol.toStringTag](){return this.constructor.name}toString(){return Object.prototype.toString.call(this)}get(l){const d=this.getAll(l);if(d.length===0)return null;let y=d.join(", ");return /^content-encoding$/i.test(l)&&(y=y.toLowerCase()),y}forEach(l,d=void 0){for(const y of this.keys())Reflect.apply(l,d,[this.get(y),y,this]);}*values(){for(const l of this.keys())yield this.get(l);}*entries(){for(const l of this.keys())yield [l,this.get(l)];}[Symbol.iterator](){return this.entries()}raw(){return [...this.keys()].reduce((l,d)=>(l[d]=this.getAll(d),l),{})}[Symbol.for("nodejs.util.inspect.custom")](){return [...this.keys()].reduce((l,d)=>{const y=this.getAll(d);return d==="host"?l[d]=y[0]:l[d]=y.length>1?y:y[0],l},{})}};u$1(Kt$2,"Headers");let Headers$2=Kt$2;Object.defineProperties(Headers$2.prototype,["get","entries","forEach","values"].reduce((c,l)=>(c[l]={enumerable:!0},c),{}));function fromRawHeaders(c=[]){return new Headers$2(c.reduce((l,d,y,b)=>(y%2===0&&l.push(b.slice(y,y+2)),l),[]).filter(([l,d])=>{try{return validateHeaderName(l),validateHeaderValue(l,String(d)),!0}catch{return !1}}))}u$1(fromRawHeaders,"fromRawHeaders");const redirectStatus=new Set([301,302,303,307,308]),isRedirect=u$1(c=>redirectStatus.has(c),"isRedirect"),INTERNALS$1=Symbol("Response internals"),De$1=class De extends Body{constructor(l=null,d={}){super(l,d);const y=d.status!=null?d.status:200,b=new Headers$2(d.headers);if(l!==null&&!b.has("Content-Type")){const R=extractContentType(l,this);R&&b.append("Content-Type",R);}this[INTERNALS$1]={type:"default",url:d.url,status:y,statusText:d.statusText||"",headers:b,counter:d.counter,highWaterMark:d.highWaterMark};}get type(){return this[INTERNALS$1].type}get url(){return this[INTERNALS$1].url||""}get status(){return this[INTERNALS$1].status}get ok(){return this[INTERNALS$1].status>=200&&this[INTERNALS$1].status<300}get redirected(){return this[INTERNALS$1].counter>0}get statusText(){return this[INTERNALS$1].statusText}get headers(){return this[INTERNALS$1].headers}get highWaterMark(){return this[INTERNALS$1].highWaterMark}clone(){return new De(clone(this,this.highWaterMark),{type:this.type,url:this.url,status:this.status,statusText:this.statusText,headers:this.headers,ok:this.ok,redirected:this.redirected,size:this.size,highWaterMark:this.highWaterMark})}static redirect(l,d=302){if(!isRedirect(d))throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');return new De(null,{headers:{location:new URL(l).toString()},status:d})}static error(){const l=new De(null,{status:0,statusText:""});return l[INTERNALS$1].type="error",l}static json(l=void 0,d={}){const y=JSON.stringify(l);if(y===void 0)throw new TypeError("data is not JSON serializable");const b=new Headers$2(d&&d.headers);return b.has("content-type")||b.set("content-type","application/json"),new De(y,{...d,headers:b})}get[Symbol.toStringTag](){return "Response"}};u$1(De$1,"Response");let Response$1=De$1;Object.defineProperties(Response$1.prototype,{type:{enumerable:!0},url:{enumerable:!0},status:{enumerable:!0},ok:{enumerable:!0},redirected:{enumerable:!0},statusText:{enumerable:!0},headers:{enumerable:!0},clone:{enumerable:!0}});const getSearch=u$1(c=>{if(c.search)return c.search;const l=c.href.length-1,d=c.hash||(c.href[l]==="#"?"#":"");return c.href[l-d.length]==="?"?"?":""},"getSearch");function stripURLForUseAsAReferrer(c,l=!1){return c==null||(c=new URL(c),/^(about|blob|data):$/.test(c.protocol))?"no-referrer":(c.username="",c.password="",c.hash="",l&&(c.pathname="",c.search=""),c)}u$1(stripURLForUseAsAReferrer,"stripURLForUseAsAReferrer");const ReferrerPolicy=new Set(["","no-referrer","no-referrer-when-downgrade","same-origin","origin","strict-origin","origin-when-cross-origin","strict-origin-when-cross-origin","unsafe-url"]),DEFAULT_REFERRER_POLICY="strict-origin-when-cross-origin";function validateReferrerPolicy(c){if(!ReferrerPolicy.has(c))throw new TypeError(`Invalid referrerPolicy: ${c}`);return c}u$1(validateReferrerPolicy,"validateReferrerPolicy");function isOriginPotentiallyTrustworthy(c){if(/^(http|ws)s:$/.test(c.protocol))return !0;const l=c.host.replace(/(^\[)|(]$)/g,""),d=require$$4.isIP(l);return d===4&&/^127\./.test(l)||d===6&&/^(((0+:){7})|(::(0+:){0,6}))0*1$/.test(l)?!0:c.host==="localhost"||c.host.endsWith(".localhost")?!1:c.protocol==="file:"}u$1(isOriginPotentiallyTrustworthy,"isOriginPotentiallyTrustworthy");function isUrlPotentiallyTrustworthy(c){return /^about:(blank|srcdoc)$/.test(c)||c.protocol==="data:"||/^(blob|filesystem):$/.test(c.protocol)?!0:isOriginPotentiallyTrustworthy(c)}u$1(isUrlPotentiallyTrustworthy,"isUrlPotentiallyTrustworthy");function determineRequestsReferrer(c,{referrerURLCallback:l,referrerOriginCallback:d}={}){if(c.referrer==="no-referrer"||c.referrerPolicy==="")return null;const y=c.referrerPolicy;if(c.referrer==="about:client")return "no-referrer";const b=c.referrer;let R=stripURLForUseAsAReferrer(b),w=stripURLForUseAsAReferrer(b,!0);R.toString().length>4096&&(R=w),l&&(R=l(R)),d&&(w=d(w));const v=new URL(c.url);switch(y){case"no-referrer":return "no-referrer";case"origin":return w;case"unsafe-url":return R;case"strict-origin":return isUrlPotentiallyTrustworthy(R)&&!isUrlPotentiallyTrustworthy(v)?"no-referrer":w.toString();case"strict-origin-when-cross-origin":return R.origin===v.origin?R:isUrlPotentiallyTrustworthy(R)&&!isUrlPotentiallyTrustworthy(v)?"no-referrer":w;case"same-origin":return R.origin===v.origin?R:"no-referrer";case"origin-when-cross-origin":return R.origin===v.origin?R:w;case"no-referrer-when-downgrade":return isUrlPotentiallyTrustworthy(R)&&!isUrlPotentiallyTrustworthy(v)?"no-referrer":R;default:throw new TypeError(`Invalid referrerPolicy: ${y}`)}}u$1(determineRequestsReferrer,"determineRequestsReferrer");function parseReferrerPolicyFromHeader(c){const l=(c.get("referrer-policy")||"").split(/[,\s]+/);let d="";for(const y of l)y&&ReferrerPolicy.has(y)&&(d=y);return d}u$1(parseReferrerPolicyFromHeader,"parseReferrerPolicyFromHeader");const INTERNALS=Symbol("Request internals"),isRequest=u$1(c=>typeof c=="object"&&typeof c[INTERNALS]=="object","isRequest"),doBadDataWarn=require$$0.deprecate(()=>{},".data is not a valid RequestInit property, use .body instead","https://github.com/node-fetch/node-fetch/issues/1000 (request)"),Jt$2=class Jt extends Body{constructor(l,d={}){let y;if(isRequest(l)?y=new URL(l.url):(y=new URL(l),l={}),y.username!==""||y.password!=="")throw new TypeError(`${y} is an url with embedded credentials.`);let b=d.method||l.method||"GET";if(/^(delete|get|head|options|post|put)$/i.test(b)&&(b=b.toUpperCase()),!isRequest(d)&&"data"in d&&doBadDataWarn(),(d.body!=null||isRequest(l)&&l.body!==null)&&(b==="GET"||b==="HEAD"))throw new TypeError("Request with GET/HEAD method cannot have body");const R=d.body?d.body:isRequest(l)&&l.body!==null?clone(l):null;super(R,{size:d.size||l.size||0});const w=new Headers$2(d.headers||l.headers||{});if(R!==null&&!w.has("Content-Type")){const B=extractContentType(R,this);B&&w.set("Content-Type",B);}let v=isRequest(l)?l.signal:null;if("signal"in d&&(v=d.signal),v!=null&&!isAbortSignal(v))throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");let I=d.referrer==null?l.referrer:d.referrer;if(I==="")I="no-referrer";else if(I){const B=new URL(I);I=/^about:(\/\/)?client$/.test(B)?"client":B;}else I=void 0;this[INTERNALS]={method:b,redirect:d.redirect||l.redirect||"follow",headers:w,parsedURL:y,signal:v,referrer:I},this.follow=d.follow===void 0?l.follow===void 0?20:l.follow:d.follow,this.compress=d.compress===void 0?l.compress===void 0?!0:l.compress:d.compress,this.counter=d.counter||l.counter||0,this.agent=d.agent||l.agent,this.highWaterMark=d.highWaterMark||l.highWaterMark||16384,this.insecureHTTPParser=d.insecureHTTPParser||l.insecureHTTPParser||!1,this.referrerPolicy=d.referrerPolicy||l.referrerPolicy||"";}get method(){return this[INTERNALS].method}get url(){return require$$1.format(this[INTERNALS].parsedURL)}get headers(){return this[INTERNALS].headers}get redirect(){return this[INTERNALS].redirect}get signal(){return this[INTERNALS].signal}get referrer(){if(this[INTERNALS].referrer==="no-referrer")return "";if(this[INTERNALS].referrer==="client")return "about:client";if(this[INTERNALS].referrer)return this[INTERNALS].referrer.toString()}get referrerPolicy(){return this[INTERNALS].referrerPolicy}set referrerPolicy(l){this[INTERNALS].referrerPolicy=validateReferrerPolicy(l);}clone(){return new Jt(this)}get[Symbol.toStringTag](){return "Request"}};u$1(Jt$2,"Request");let Request$1=Jt$2;Object.defineProperties(Request$1.prototype,{method:{enumerable:!0},url:{enumerable:!0},headers:{enumerable:!0},redirect:{enumerable:!0},clone:{enumerable:!0},signal:{enumerable:!0},referrer:{enumerable:!0},referrerPolicy:{enumerable:!0}});const getNodeRequestOptions=u$1(c=>{const{parsedURL:l}=c[INTERNALS],d=new Headers$2(c[INTERNALS].headers);d.has("Accept")||d.set("Accept","*/*");let y=null;if(c.body===null&&/^(post|put)$/i.test(c.method)&&(y="0"),c.body!==null){const v=getTotalBytes(c);typeof v=="number"&&!Number.isNaN(v)&&(y=String(v));}y&&d.set("Content-Length",y),c.referrerPolicy===""&&(c.referrerPolicy=DEFAULT_REFERRER_POLICY),c.referrer&&c.referrer!=="no-referrer"?c[INTERNALS].referrer=determineRequestsReferrer(c):c[INTERNALS].referrer="no-referrer",c[INTERNALS].referrer instanceof URL&&d.set("Referer",c.referrer),d.has("User-Agent")||d.set("User-Agent","node-fetch"),c.compress&&!d.has("Accept-Encoding")&&d.set("Accept-Encoding","gzip, deflate, br");let{agent:b}=c;typeof b=="function"&&(b=b(l));const R=getSearch(l),w={path:l.pathname+R,method:c.method,headers:d[Symbol.for("nodejs.util.inspect.custom")](),insecureHTTPParser:c.insecureHTTPParser,agent:b};return {parsedURL:l,options:w}},"getNodeRequestOptions"),sn$1=class sn extends FetchBaseError{constructor(l,d="aborted"){super(l,d);}};u$1(sn$1,"AbortError");let AbortError=sn$1;/*! node-domexception. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */if(!globalThis.DOMException)try{const{MessageChannel:c}=require("worker_threads"),l=new c().port1,d=new ArrayBuffer;l.postMessage(d,[d,d]);}catch(c){c.constructor.name==="DOMException"&&(globalThis.DOMException=c.constructor);}var nodeDomexception=globalThis.DOMException;const DOMException=_commonjsHelpers.getDefaultExportFromCjs(nodeDomexception),{stat}=node_fs.promises,blobFromSync=u$1((c,l)=>fromBlob(node_fs.statSync(c),c,l),"blobFromSync"),blobFrom=u$1((c,l)=>stat(c).then(d=>fromBlob(d,c,l)),"blobFrom"),fileFrom=u$1((c,l)=>stat(c).then(d=>fromFile(d,c,l)),"fileFrom"),fileFromSync=u$1((c,l)=>fromFile(node_fs.statSync(c),c,l),"fileFromSync"),fromBlob=u$1((c,l,d="")=>new r$1([new BlobDataItem({path:l,size:c.size,lastModified:c.mtimeMs,start:0})],{type:d}),"fromBlob"),fromFile=u$1((c,l,d="")=>new File$1([new BlobDataItem({path:l,size:c.size,lastModified:c.mtimeMs,start:0})],node_path.basename(l),{type:d,lastModified:c.mtimeMs}),"fromFile"),Xt$2=class Xt{constructor(l){ye$1(this,Me$1,void 0);ye$1(this,xe$1,void 0);ne$3(this,Me$1,l.path),ne$3(this,xe$1,l.start),this.size=l.size,this.lastModified=l.lastModified;}slice(l,d){return new Xt({path:D$4(this,Me$1),lastModified:this.lastModified,size:d-l,start:D$4(this,xe$1)+l})}async*stream(){const{mtimeMs:l}=await stat(D$4(this,Me$1));if(l>this.lastModified)throw new DOMException("The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.","NotReadableError");yield*node_fs.createReadStream(D$4(this,Me$1),{start:D$4(this,xe$1),end:D$4(this,xe$1)+this.size-1});}get[Symbol.toStringTag](){return "Blob"}};Me$1=new WeakMap,xe$1=new WeakMap,u$1(Xt$2,"BlobDataItem");let BlobDataItem=Xt$2;const supportedSchemas=new Set(["data:","http:","https:"]);async function fetch$1(c,l){return new Promise((d,y)=>{const b=new Request$1(c,l),{parsedURL:R,options:w}=getNodeRequestOptions(b);if(!supportedSchemas.has(R.protocol))throw new TypeError(`node-fetch cannot load ${c}. URL scheme "${R.protocol.replace(/:$/,"")}" is not supported.`);if(R.protocol==="data:"){const E=dataUriToBuffer(b.url),K=new Response$1(E,{headers:{"Content-Type":E.typeFull}});d(K);return}const v=(R.protocol==="https:"?https__default:http__default).request,{signal:I}=b;let B=null;const F=u$1(()=>{const E=new AbortError("The operation was aborted.");y(E),b.body&&b.body instanceof Stream__default.Readable&&b.body.destroy(E),!(!B||!B.body)&&B.body.emit("error",E);},"abort");if(I&&I.aborted){F();return}const k=u$1(()=>{F(),$();},"abortAndFinalize"),T=v(R.toString(),w);I&&I.addEventListener("abort",k);const $=u$1(()=>{T.abort(),I&&I.removeEventListener("abort",k);},"finalize");T.on("error",E=>{y(new FetchError$1(`request to ${b.url} failed, reason: ${E.message}`,"system",E)),$();}),fixResponseChunkedTransferBadEnding(T,E=>{B&&B.body&&B.body.destroy(E);}),process.version<"v14"&&T.on("socket",E=>{let K;E.prependListener("end",()=>{K=E._eventsCount;}),E.prependListener("close",U=>{if(B&&K<E._eventsCount&&!U){const N=new Error("Premature close");N.code="ERR_STREAM_PREMATURE_CLOSE",B.body.emit("error",N);}});}),T.on("response",E=>{T.setTimeout(0);const K=fromRawHeaders(E.rawHeaders);if(isRedirect(E.statusCode)){const M=K.get("Location");let H=null;try{H=M===null?null:new URL(M,b.url);}catch{if(b.redirect!=="manual"){y(new FetchError$1(`uri requested responds with an invalid redirect URL: ${M}`,"invalid-redirect")),$();return}}switch(b.redirect){case"error":y(new FetchError$1(`uri requested responds with a redirect, redirect mode is set to error: ${b.url}`,"no-redirect")),$();return;case"manual":break;case"follow":{if(H===null)break;if(b.counter>=b.follow){y(new FetchError$1(`maximum redirect reached at: ${b.url}`,"max-redirect")),$();return}const G={headers:new Headers$2(b.headers),follow:b.follow,counter:b.counter+1,agent:b.agent,compress:b.compress,method:b.method,body:clone(b),signal:b.signal,size:b.size,referrer:b.referrer,referrerPolicy:b.referrerPolicy};if(!isDomainOrSubdomain(b.url,H)||!isSameProtocol(b.url,H))for(const wt of ["authorization","www-authenticate","cookie","cookie2"])G.headers.delete(wt);if(E.statusCode!==303&&b.body&&l.body instanceof Stream__default.Readable){y(new FetchError$1("Cannot follow redirect with body being a readable stream","unsupported-redirect")),$();return}(E.statusCode===303||(E.statusCode===301||E.statusCode===302)&&b.method==="POST")&&(G.method="GET",G.body=void 0,G.headers.delete("content-length"));const Q=parseReferrerPolicyFromHeader(K);Q&&(G.referrerPolicy=Q),d(fetch$1(new Request$1(H,G))),$();return}default:return y(new TypeError(`Redirect option '${b.redirect}' is not a valid value of RequestRedirect`))}}I&&E.once("end",()=>{I.removeEventListener("abort",k);});let U=Stream.pipeline(E,new Stream.PassThrough,M=>{M&&y(M);});process.version<"v12.10"&&E.on("aborted",k);const N={url:b.url,status:E.statusCode,statusText:E.statusMessage,headers:K,size:b.size,counter:b.counter,highWaterMark:b.highWaterMark},J=K.get("Content-Encoding");if(!b.compress||b.method==="HEAD"||J===null||E.statusCode===204||E.statusCode===304){B=new Response$1(U,N),d(B);return}const ge={flush:zlib__default.Z_SYNC_FLUSH,finishFlush:zlib__default.Z_SYNC_FLUSH};if(J==="gzip"||J==="x-gzip"){U=Stream.pipeline(U,zlib__default.createGunzip(ge),M=>{M&&y(M);}),B=new Response$1(U,N),d(B);return}if(J==="deflate"||J==="x-deflate"){const M=Stream.pipeline(E,new Stream.PassThrough,H=>{H&&y(H);});M.once("data",H=>{(H[0]&15)===8?U=Stream.pipeline(U,zlib__default.createInflate(),G=>{G&&y(G);}):U=Stream.pipeline(U,zlib__default.createInflateRaw(),G=>{G&&y(G);}),B=new Response$1(U,N),d(B);}),M.once("end",()=>{B||(B=new Response$1(U,N),d(B));});return}if(J==="br"){U=Stream.pipeline(U,zlib__default.createBrotliDecompress(),M=>{M&&y(M);}),B=new Response$1(U,N),d(B);return}B=new Response$1(U,N),d(B);}),writeToStream(T,b).catch(y);})}u$1(fetch$1,"fetch$1");function fixResponseChunkedTransferBadEnding(c,l){const d=require$$6.Buffer.from(`0\r
\r
`);let y=!1,b=!1,R;c.on("response",w=>{const{headers:v}=w;y=v["transfer-encoding"]==="chunked"&&!v["content-length"];}),c.on("socket",w=>{const v=u$1(()=>{if(y&&!b){const B=new Error("Premature close");B.code="ERR_STREAM_PREMATURE_CLOSE",l(B);}},"onSocketClose"),I=u$1(B=>{b=require$$6.Buffer.compare(B.slice(-5),d)===0,!b&&R&&(b=require$$6.Buffer.compare(R.slice(-3),d.slice(0,3))===0&&require$$6.Buffer.compare(B.slice(-2),d.slice(3))===0),R=B;},"onData");w.prependListener("close",v),w.on("data",I),c.on("close",()=>{w.removeListener("close",v),w.removeListener("data",I);});});}u$1(fixResponseChunkedTransferBadEnding,"fixResponseChunkedTransferBadEnding");const privateData=new WeakMap,wrappers=new WeakMap;function pd(c){const l=privateData.get(c);return console.assert(l!=null,"'this' is expected an Event object, but got",c),l}u$1(pd,"pd");function setCancelFlag(c){if(c.passiveListener!=null){typeof console<"u"&&typeof console.error=="function"&&console.error("Unable to preventDefault inside passive event listener invocation.",c.passiveListener);return}c.event.cancelable&&(c.canceled=!0,typeof c.event.preventDefault=="function"&&c.event.preventDefault());}u$1(setCancelFlag,"setCancelFlag");function Event(c,l){privateData.set(this,{eventTarget:c,event:l,eventPhase:2,currentTarget:c,canceled:!1,stopped:!1,immediateStopped:!1,passiveListener:null,timeStamp:l.timeStamp||Date.now()}),Object.defineProperty(this,"isTrusted",{value:!1,enumerable:!0});const d=Object.keys(l);for(let y=0;y<d.length;++y){const b=d[y];b in this||Object.defineProperty(this,b,defineRedirectDescriptor(b));}}u$1(Event,"Event"),Event.prototype={get type(){return pd(this).event.type},get target(){return pd(this).eventTarget},get currentTarget(){return pd(this).currentTarget},composedPath(){const c=pd(this).currentTarget;return c==null?[]:[c]},get NONE(){return 0},get CAPTURING_PHASE(){return 1},get AT_TARGET(){return 2},get BUBBLING_PHASE(){return 3},get eventPhase(){return pd(this).eventPhase},stopPropagation(){const c=pd(this);c.stopped=!0,typeof c.event.stopPropagation=="function"&&c.event.stopPropagation();},stopImmediatePropagation(){const c=pd(this);c.stopped=!0,c.immediateStopped=!0,typeof c.event.stopImmediatePropagation=="function"&&c.event.stopImmediatePropagation();},get bubbles(){return !!pd(this).event.bubbles},get cancelable(){return !!pd(this).event.cancelable},preventDefault(){setCancelFlag(pd(this));},get defaultPrevented(){return pd(this).canceled},get composed(){return !!pd(this).event.composed},get timeStamp(){return pd(this).timeStamp},get srcElement(){return pd(this).eventTarget},get cancelBubble(){return pd(this).stopped},set cancelBubble(c){if(!c)return;const l=pd(this);l.stopped=!0,typeof l.event.cancelBubble=="boolean"&&(l.event.cancelBubble=!0);},get returnValue(){return !pd(this).canceled},set returnValue(c){c||setCancelFlag(pd(this));},initEvent(){}},Object.defineProperty(Event.prototype,"constructor",{value:Event,configurable:!0,writable:!0});function defineRedirectDescriptor(c){return {get(){return pd(this).event[c]},set(l){pd(this).event[c]=l;},configurable:!0,enumerable:!0}}u$1(defineRedirectDescriptor,"defineRedirectDescriptor");function defineCallDescriptor(c){return {value(){const l=pd(this).event;return l[c].apply(l,arguments)},configurable:!0,enumerable:!0}}u$1(defineCallDescriptor,"defineCallDescriptor");function defineWrapper(c,l){const d=Object.keys(l);if(d.length===0)return c;function y(b,R){c.call(this,b,R);}u$1(y,"CustomEvent"),y.prototype=Object.create(c.prototype,{constructor:{value:y,configurable:!0,writable:!0}});for(let b=0;b<d.length;++b){const R=d[b];if(!(R in c.prototype)){const v=typeof Object.getOwnPropertyDescriptor(l,R).value=="function";Object.defineProperty(y.prototype,R,v?defineCallDescriptor(R):defineRedirectDescriptor(R));}}return y}u$1(defineWrapper,"defineWrapper");function getWrapper(c){if(c==null||c===Object.prototype)return Event;let l=wrappers.get(c);return l==null&&(l=defineWrapper(getWrapper(Object.getPrototypeOf(c)),c),wrappers.set(c,l)),l}u$1(getWrapper,"getWrapper");function wrapEvent(c,l){const d=getWrapper(Object.getPrototypeOf(l));return new d(c,l)}u$1(wrapEvent,"wrapEvent");function isStopped(c){return pd(c).immediateStopped}u$1(isStopped,"isStopped");function setEventPhase(c,l){pd(c).eventPhase=l;}u$1(setEventPhase,"setEventPhase");function setCurrentTarget(c,l){pd(c).currentTarget=l;}u$1(setCurrentTarget,"setCurrentTarget");function setPassiveListener(c,l){pd(c).passiveListener=l;}u$1(setPassiveListener,"setPassiveListener");const listenersMap=new WeakMap,CAPTURE=1,BUBBLE=2,ATTRIBUTE=3;function isObject(c){return c!==null&&typeof c=="object"}u$1(isObject,"isObject");function getListeners(c){const l=listenersMap.get(c);if(l==null)throw new TypeError("'this' is expected an EventTarget object, but got another value.");return l}u$1(getListeners,"getListeners");function defineEventAttributeDescriptor(c){return {get(){let d=getListeners(this).get(c);for(;d!=null;){if(d.listenerType===ATTRIBUTE)return d.listener;d=d.next;}return null},set(l){typeof l!="function"&&!isObject(l)&&(l=null);const d=getListeners(this);let y=null,b=d.get(c);for(;b!=null;)b.listenerType===ATTRIBUTE?y!==null?y.next=b.next:b.next!==null?d.set(c,b.next):d.delete(c):y=b,b=b.next;if(l!==null){const R={listener:l,listenerType:ATTRIBUTE,passive:!1,once:!1,next:null};y===null?d.set(c,R):y.next=R;}},configurable:!0,enumerable:!0}}u$1(defineEventAttributeDescriptor,"defineEventAttributeDescriptor");function defineEventAttribute(c,l){Object.defineProperty(c,`on${l}`,defineEventAttributeDescriptor(l));}u$1(defineEventAttribute,"defineEventAttribute");function defineCustomEventTarget(c){function l(){EventTarget.call(this);}u$1(l,"CustomEventTarget"),l.prototype=Object.create(EventTarget.prototype,{constructor:{value:l,configurable:!0,writable:!0}});for(let d=0;d<c.length;++d)defineEventAttribute(l.prototype,c[d]);return l}u$1(defineCustomEventTarget,"defineCustomEventTarget");function EventTarget(){if(this instanceof EventTarget){listenersMap.set(this,new Map);return}if(arguments.length===1&&Array.isArray(arguments[0]))return defineCustomEventTarget(arguments[0]);if(arguments.length>0){const c=new Array(arguments.length);for(let l=0;l<arguments.length;++l)c[l]=arguments[l];return defineCustomEventTarget(c)}throw new TypeError("Cannot call a class as a function")}u$1(EventTarget,"EventTarget"),EventTarget.prototype={addEventListener(c,l,d){if(l==null)return;if(typeof l!="function"&&!isObject(l))throw new TypeError("'listener' should be a function or an object.");const y=getListeners(this),b=isObject(d),w=(b?!!d.capture:!!d)?CAPTURE:BUBBLE,v={listener:l,listenerType:w,passive:b&&!!d.passive,once:b&&!!d.once,next:null};let I=y.get(c);if(I===void 0){y.set(c,v);return}let B=null;for(;I!=null;){if(I.listener===l&&I.listenerType===w)return;B=I,I=I.next;}B.next=v;},removeEventListener(c,l,d){if(l==null)return;const y=getListeners(this),R=(isObject(d)?!!d.capture:!!d)?CAPTURE:BUBBLE;let w=null,v=y.get(c);for(;v!=null;){if(v.listener===l&&v.listenerType===R){w!==null?w.next=v.next:v.next!==null?y.set(c,v.next):y.delete(c);return}w=v,v=v.next;}},dispatchEvent(c){if(c==null||typeof c.type!="string")throw new TypeError('"event.type" should be a string.');const l=getListeners(this),d=c.type;let y=l.get(d);if(y==null)return !0;const b=wrapEvent(this,c);let R=null;for(;y!=null;){if(y.once?R!==null?R.next=y.next:y.next!==null?l.set(d,y.next):l.delete(d):R=y,setPassiveListener(b,y.passive?y.listener:null),typeof y.listener=="function")try{y.listener.call(this,b);}catch(w){typeof console<"u"&&typeof console.error=="function"&&console.error(w);}else y.listenerType!==ATTRIBUTE&&typeof y.listener.handleEvent=="function"&&y.listener.handleEvent(b);if(isStopped(b))break;y=y.next;}return setPassiveListener(b,null),setEventPhase(b,0),setCurrentTarget(b,null),!b.defaultPrevented}},Object.defineProperty(EventTarget.prototype,"constructor",{value:EventTarget,configurable:!0,writable:!0});const an$1=class an extends EventTarget{constructor(){throw super(),new TypeError("AbortSignal cannot be constructed directly")}get aborted(){const l=abortedFlags.get(this);if(typeof l!="boolean")throw new TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this===null?"null":typeof this}`);return l}};u$1(an$1,"AbortSignal");let AbortSignal=an$1;defineEventAttribute(AbortSignal.prototype,"abort");function createAbortSignal(){const c=Object.create(AbortSignal.prototype);return EventTarget.call(c),abortedFlags.set(c,!1),c}u$1(createAbortSignal,"createAbortSignal");function abortSignal(c){abortedFlags.get(c)===!1&&(abortedFlags.set(c,!0),c.dispatchEvent({type:"abort"}));}u$1(abortSignal,"abortSignal");const abortedFlags=new WeakMap;Object.defineProperties(AbortSignal.prototype,{aborted:{enumerable:!0}}),typeof Symbol=="function"&&typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(AbortSignal.prototype,Symbol.toStringTag,{configurable:!0,value:"AbortSignal"});let AbortController$1$1=(St$2=class{constructor(){signals.set(this,createAbortSignal());}get signal(){return getSignal(this)}abort(){abortSignal(getSignal(this));}},u$1(St$2,"AbortController"),St$2);const signals=new WeakMap;function getSignal(c){const l=signals.get(c);if(l==null)throw new TypeError(`Expected 'this' to be an 'AbortController' object, but got ${c===null?"null":typeof c}`);return l}u$1(getSignal,"getSignal"),Object.defineProperties(AbortController$1$1.prototype,{signal:{enumerable:!0},abort:{enumerable:!0}}),typeof Symbol=="function"&&typeof Symbol.toStringTag=="symbol"&&Object.defineProperty(AbortController$1$1.prototype,Symbol.toStringTag,{configurable:!0,value:"AbortController"});var t$2=Object.defineProperty,e$2=u$1((c,l)=>t$2(c,"name",{value:l,configurable:!0}),"e");const fetch$2=fetch$1;s$1();function s$1(){!globalThis.process?.versions?.node&&!globalThis.process?.env.DISABLE_NODE_FETCH_NATIVE_WARN&&console.warn("[node-fetch-native] Node.js compatible build of `node-fetch-native` is being used in a non-Node.js environment. Please make sure you are using proper export conditions or report this issue to https://github.com/unjs/node-fetch-native. You can set `process.env.DISABLE_NODE_FETCH_NATIVE_WARN` to disable this warning.");}u$1(s$1,"s"),e$2(s$1,"checkNodeEnvironment"),node$1.AbortController=AbortController$1$1,node$1.AbortError=AbortError,node$1.Blob=r$1,node$1.FetchError=FetchError$1,node$1.File=File$1,node$1.FormData=FormData,node$1.Headers=Headers$2,node$1.Request=Request$1,node$1.Response=Response$1,node$1.blobFrom=blobFrom,node$1.blobFromSync=blobFromSync,node$1.default=fetch$2,node$1.fetch=fetch$2,node$1.fileFrom=fileFrom,node$1.fileFromSync=fileFromSync,node$1.isRedirect=isRedirect;

var n$1=Object.defineProperty;var i$1=(r,o)=>n$1(r,"name",{value:o,configurable:!0});const node=node$1;var t=Object.defineProperty,a$2=i$1((r,o)=>t(r,"name",{value:o,configurable:!0}),"a");function e(r,o){if(!(r in globalThis))try{globalThis[r]=o;}catch{}}i$1(e,"e"),a$2(e,"polyfill"),e("fetch",node.fetch),e("Blob",node.Blob),e("File",node.File),e("FormData",node.FormData),e("Headers",node.Headers),e("Request",node.Request),e("Response",node.Response),e("AbortController",node.AbortController);

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  const _value = value.trim();
  if (
    // eslint-disable-next-line unicorn/prefer-at
    value[0] === '"' && value.endsWith('"') && !value.includes("\\")
  ) {
    return _value.slice(1, -1);
  }
  if (_value.length <= 9) {
    const _lval = _value.toLowerCase();
    if (_lval === "true") {
      return true;
    }
    if (_lval === "false") {
      return false;
    }
    if (_lval === "undefined") {
      return void 0;
    }
    if (_lval === "null") {
      return null;
    }
    if (_lval === "nan") {
      return Number.NaN;
    }
    if (_lval === "infinity") {
      return Number.POSITIVE_INFINITY;
    }
    if (_lval === "-infinity") {
      return Number.NEGATIVE_INFINITY;
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = {};
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map((_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const defaults = Object.freeze({
  ignoreUnknown: false,
  respectType: false,
  respectFunctionNames: false,
  respectFunctionProperties: false,
  unorderedObjects: true,
  unorderedArrays: false,
  unorderedSets: false,
  excludeKeys: void 0,
  excludeValues: void 0,
  replacer: void 0
});
function objectHash(object, options) {
  if (options) {
    options = { ...defaults, ...options };
  } else {
    options = defaults;
  }
  const hasher = createHasher(options);
  hasher.dispatch(object);
  return hasher.toString();
}
const defaultPrototypesKeys = Object.freeze([
  "prototype",
  "__proto__",
  "constructor"
]);
function createHasher(options) {
  let buff = "";
  let context = /* @__PURE__ */ new Map();
  const write = (str) => {
    buff += str;
  };
  return {
    toString() {
      return buff;
    },
    getContext() {
      return context;
    },
    dispatch(value) {
      if (options.replacer) {
        value = options.replacer(value);
      }
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    },
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      if (objectLength < 10) {
        objType = "unknown:[" + objString + "]";
      } else {
        objType = objString.slice(8, objectLength - 1);
      }
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = context.get(object)) === void 0) {
        context.set(object, context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        write("buffer:");
        return write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else if (!options.ignoreUnknown) {
          this.unkown(object, objType);
        }
      } else {
        let keys = Object.keys(object);
        if (options.unorderedObjects) {
          keys = keys.sort();
        }
        let extraKeys = [];
        if (options.respectType !== false && !isNativeFunction(object)) {
          extraKeys = defaultPrototypesKeys;
        }
        if (options.excludeKeys) {
          keys = keys.filter((key) => {
            return !options.excludeKeys(key);
          });
          extraKeys = extraKeys.filter((key) => {
            return !options.excludeKeys(key);
          });
        }
        write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          write(":");
          if (!options.excludeValues) {
            this.dispatch(object[key]);
          }
          write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    },
    array(arr, unordered) {
      unordered = unordered === void 0 ? options.unorderedArrays !== false : unordered;
      write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = createHasher(options);
        hasher.dispatch(entry);
        for (const [key, value] of hasher.getContext()) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    },
    date(date) {
      return write("date:" + date.toJSON());
    },
    symbol(sym) {
      return write("symbol:" + sym.toString());
    },
    unkown(value, type) {
      write(type);
      if (!value) {
        return;
      }
      write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          Array.from(value.entries()),
          true
          /* ordered */
        );
      }
    },
    error(err) {
      return write("error:" + err.toString());
    },
    boolean(bool) {
      return write("bool:" + bool);
    },
    string(string) {
      write("string:" + string.length + ":");
      write(string);
    },
    function(fn) {
      write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
      if (options.respectFunctionNames !== false) {
        this.dispatch("function-name:" + String(fn.name));
      }
      if (options.respectFunctionProperties) {
        this.object(fn);
      }
    },
    number(number) {
      return write("number:" + number);
    },
    xml(xml) {
      return write("xml:" + xml.toString());
    },
    null() {
      return write("Null");
    },
    undefined() {
      return write("Undefined");
    },
    regexp(regex) {
      return write("regex:" + regex.toString());
    },
    uint8array(arr) {
      write("uint8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint8clampedarray(arr) {
      write("uint8clampedarray:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int8array(arr) {
      write("int8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint16array(arr) {
      write("uint16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int16array(arr) {
      write("int16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint32array(arr) {
      write("uint32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int32array(arr) {
      write("int32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float32array(arr) {
      write("float32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float64array(arr) {
      write("float64array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    arraybuffer(arr) {
      write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    },
    url(url) {
      return write("url:" + url.toString());
    },
    map(map) {
      write("map:");
      const arr = [...map];
      return this.array(arr, options.unorderedSets !== false);
    },
    set(set) {
      write("set:");
      const arr = [...set];
      return this.array(arr, options.unorderedSets !== false);
    },
    file(file) {
      write("file:");
      return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
    },
    blob() {
      if (options.ignoreUnknown) {
        return write("[blob]");
      }
      throw new Error(
        'Hashing Blob objects is currently not supported\nUse "options.replacer" or "options.ignoreUnknown"\n'
      );
    },
    domwindow() {
      return write("domwindow");
    },
    bigint(number) {
      return write("bigint:" + number.toString());
    },
    /* Node.js standard native objects */
    process() {
      return write("process");
    },
    timer() {
      return write("timer");
    },
    pipe() {
      return write("pipe");
    },
    tcp() {
      return write("tcp");
    },
    udp() {
      return write("udp");
    },
    tty() {
      return write("tty");
    },
    statwatcher() {
      return write("statwatcher");
    },
    securecontext() {
      return write("securecontext");
    },
    connection() {
      return write("connection");
    },
    zlib() {
      return write("zlib");
    },
    context() {
      return write("context");
    },
    nodescript() {
      return write("nodescript");
    },
    httpparser() {
      return write("httpparser");
    },
    dataview() {
      return write("dataview");
    },
    signal() {
      return write("signal");
    },
    fsevent() {
      return write("fsevent");
    },
    tlswrap() {
      return write("tlswrap");
    }
  };
}
const nativeFunc = "[native code] }";
const nativeFuncLength = nativeFunc.length;
function isNativeFunction(f) {
  if (typeof f !== "function") {
    return false;
  }
  return Function.prototype.toString.call(f).slice(-nativeFuncLength) === nativeFunc;
}

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class WordArray {
  constructor(words, sigBytes) {
    __publicField$1(this, "words");
    __publicField$1(this, "sigBytes");
    words = this.words = words || [];
    this.sigBytes = sigBytes === void 0 ? words.length * 4 : sigBytes;
  }
  toString(encoder) {
    return (encoder || Hex).stringify(this);
  }
  concat(wordArray) {
    this.clamp();
    if (this.sigBytes % 4) {
      for (let i = 0; i < wordArray.sigBytes; i++) {
        const thatByte = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
        this.words[this.sigBytes + i >>> 2] |= thatByte << 24 - (this.sigBytes + i) % 4 * 8;
      }
    } else {
      for (let j = 0; j < wordArray.sigBytes; j += 4) {
        this.words[this.sigBytes + j >>> 2] = wordArray.words[j >>> 2];
      }
    }
    this.sigBytes += wordArray.sigBytes;
    return this;
  }
  clamp() {
    this.words[this.sigBytes >>> 2] &= 4294967295 << 32 - this.sigBytes % 4 * 8;
    this.words.length = Math.ceil(this.sigBytes / 4);
  }
  clone() {
    return new WordArray([...this.words]);
  }
}
const Hex = {
  stringify(wordArray) {
    const hexChars = [];
    for (let i = 0; i < wordArray.sigBytes; i++) {
      const bite = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      hexChars.push((bite >>> 4).toString(16), (bite & 15).toString(16));
    }
    return hexChars.join("");
  }
};
const Base64 = {
  stringify(wordArray) {
    const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const base64Chars = [];
    for (let i = 0; i < wordArray.sigBytes; i += 3) {
      const byte1 = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      const byte2 = wordArray.words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
      const byte3 = wordArray.words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
      const triplet = byte1 << 16 | byte2 << 8 | byte3;
      for (let j = 0; j < 4 && i * 8 + j * 6 < wordArray.sigBytes * 8; j++) {
        base64Chars.push(keyStr.charAt(triplet >>> 6 * (3 - j) & 63));
      }
    }
    return base64Chars.join("");
  }
};
const Latin1 = {
  parse(latin1Str) {
    const latin1StrLength = latin1Str.length;
    const words = [];
    for (let i = 0; i < latin1StrLength; i++) {
      words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
    }
    return new WordArray(words, latin1StrLength);
  }
};
const Utf8 = {
  parse(utf8Str) {
    return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
  }
};
class BufferedBlockAlgorithm {
  constructor() {
    __publicField$1(this, "_data", new WordArray());
    __publicField$1(this, "_nDataBytes", 0);
    __publicField$1(this, "_minBufferSize", 0);
    __publicField$1(this, "blockSize", 512 / 32);
  }
  reset() {
    this._data = new WordArray();
    this._nDataBytes = 0;
  }
  _append(data) {
    if (typeof data === "string") {
      data = Utf8.parse(data);
    }
    this._data.concat(data);
    this._nDataBytes += data.sigBytes;
  }
  _doProcessBlock(_dataWords, _offset) {
  }
  _process(doFlush) {
    let processedWords;
    let nBlocksReady = this._data.sigBytes / (this.blockSize * 4);
    if (doFlush) {
      nBlocksReady = Math.ceil(nBlocksReady);
    } else {
      nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    }
    const nWordsReady = nBlocksReady * this.blockSize;
    const nBytesReady = Math.min(nWordsReady * 4, this._data.sigBytes);
    if (nWordsReady) {
      for (let offset = 0; offset < nWordsReady; offset += this.blockSize) {
        this._doProcessBlock(this._data.words, offset);
      }
      processedWords = this._data.words.splice(0, nWordsReady);
      this._data.sigBytes -= nBytesReady;
    }
    return new WordArray(processedWords, nBytesReady);
  }
}
class Hasher extends BufferedBlockAlgorithm {
  update(messageUpdate) {
    this._append(messageUpdate);
    this._process();
    return this;
  }
  finalize(messageUpdate) {
    if (messageUpdate) {
      this._append(messageUpdate);
    }
  }
}

var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$3 = (obj, key, value) => {
  __defNormalProp$3(obj, key + "" , value);
  return value;
};
const H$1 = [
  1779033703,
  -1150833019,
  1013904242,
  -1521486534,
  1359893119,
  -1694144372,
  528734635,
  1541459225
];
const K$3 = [
  1116352408,
  1899447441,
  -1245643825,
  -373957723,
  961987163,
  1508970993,
  -1841331548,
  -1424204075,
  -670586216,
  310598401,
  607225278,
  1426881987,
  1925078388,
  -2132889090,
  -1680079193,
  -1046744716,
  -459576895,
  -272742522,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  -1740746414,
  -1473132947,
  -1341970488,
  -1084653625,
  -958395405,
  -710438585,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  -2117940946,
  -1838011259,
  -1564481375,
  -1474664885,
  -1035236496,
  -949202525,
  -778901479,
  -694614492,
  -200395387,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  -2067236844,
  -1933114872,
  -1866530822,
  -1538233109,
  -1090935817,
  -965641998
];
const W$4 = [];
class SHA256 extends Hasher {
  constructor() {
    super(...arguments);
    __publicField$3(this, "_hash", new WordArray([...H$1]));
  }
  /**
   * Resets the internal state of the hash object to initial values.
   */
  reset() {
    super.reset();
    this._hash = new WordArray([...H$1]);
  }
  _doProcessBlock(M, offset) {
    const H2 = this._hash.words;
    let a = H2[0];
    let b = H2[1];
    let c = H2[2];
    let d = H2[3];
    let e = H2[4];
    let f = H2[5];
    let g = H2[6];
    let h = H2[7];
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        W$4[i] = M[offset + i] | 0;
      } else {
        const gamma0x = W$4[i - 15];
        const gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
        const gamma1x = W$4[i - 2];
        const gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
        W$4[i] = gamma0 + W$4[i - 7] + gamma1 + W$4[i - 16];
      }
      const ch = e & f ^ ~e & g;
      const maj = a & b ^ a & c ^ b & c;
      const sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
      const sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
      const t1 = h + sigma1 + ch + K$3[i] + W$4[i];
      const t2 = sigma0 + maj;
      h = g;
      g = f;
      f = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    H2[0] = H2[0] + a | 0;
    H2[1] = H2[1] + b | 0;
    H2[2] = H2[2] + c | 0;
    H2[3] = H2[3] + d | 0;
    H2[4] = H2[4] + e | 0;
    H2[5] = H2[5] + f | 0;
    H2[6] = H2[6] + g | 0;
    H2[7] = H2[7] + h | 0;
  }
  /**
   * Finishes the hash calculation and returns the hash as a WordArray.
   *
   * @param {string} messageUpdate - Additional message content to include in the hash.
   * @returns {WordArray} The finalised hash as a WordArray.
   */
  finalize(messageUpdate) {
    super.finalize(messageUpdate);
    const nBitsTotal = this._nDataBytes * 8;
    const nBitsLeft = this._data.sigBytes * 8;
    this._data.words[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(
      nBitsTotal / 4294967296
    );
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
    this._data.sigBytes = this._data.words.length * 4;
    this._process();
    return this._hash;
  }
}
function sha256base64(message) {
  return new SHA256().finalize(message).toString(Base64);
}

function hash(object, options = {}) {
  const hashed = typeof object === "string" ? object : objectHash(object, options);
  return sha256base64(hashed).slice(0, 10);
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function rawHeaders(headers) {
  const rawHeaders2 = [];
  for (const key in headers) {
    if (Array.isArray(headers[key])) {
      for (const h of headers[key]) {
        rawHeaders2.push(key, h);
      }
    } else {
      rawHeaders2.push(key, headers[key]);
    }
  }
  return rawHeaders2;
}
function mergeFns(...functions) {
  return function(...args) {
    for (const fn of functions) {
      fn(...args);
    }
  };
}
function createNotImplementedError(name) {
  throw new Error(`[unenv] ${name} is not implemented yet!`);
}

let defaultMaxListeners = 10;
let EventEmitter$1 = class EventEmitter {
  __unenv__ = true;
  _events = /* @__PURE__ */ Object.create(null);
  _maxListeners;
  static get defaultMaxListeners() {
    return defaultMaxListeners;
  }
  static set defaultMaxListeners(arg) {
    if (typeof arg !== "number" || arg < 0 || Number.isNaN(arg)) {
      throw new RangeError(
        'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + "."
      );
    }
    defaultMaxListeners = arg;
  }
  setMaxListeners(n) {
    if (typeof n !== "number" || n < 0 || Number.isNaN(n)) {
      throw new RangeError(
        'The value of "n" is out of range. It must be a non-negative number. Received ' + n + "."
      );
    }
    this._maxListeners = n;
    return this;
  }
  getMaxListeners() {
    return _getMaxListeners(this);
  }
  emit(type, ...args) {
    if (!this._events[type] || this._events[type].length === 0) {
      return false;
    }
    if (type === "error") {
      let er;
      if (args.length > 0) {
        er = args[0];
      }
      if (er instanceof Error) {
        throw er;
      }
      const err = new Error(
        "Unhandled error." + (er ? " (" + er.message + ")" : "")
      );
      err.context = er;
      throw err;
    }
    for (const _listener of this._events[type]) {
      (_listener.listener || _listener).apply(this, args);
    }
    return true;
  }
  addListener(type, listener) {
    return _addListener(this, type, listener, false);
  }
  on(type, listener) {
    return _addListener(this, type, listener, false);
  }
  prependListener(type, listener) {
    return _addListener(this, type, listener, true);
  }
  once(type, listener) {
    return this.on(type, _wrapOnce(this, type, listener));
  }
  prependOnceListener(type, listener) {
    return this.prependListener(type, _wrapOnce(this, type, listener));
  }
  removeListener(type, listener) {
    return _removeListener(this, type, listener);
  }
  off(type, listener) {
    return this.removeListener(type, listener);
  }
  removeAllListeners(type) {
    return _removeAllListeners(this, type);
  }
  listeners(type) {
    return _listeners(this, type, true);
  }
  rawListeners(type) {
    return _listeners(this, type, false);
  }
  listenerCount(type) {
    return this.rawListeners(type).length;
  }
  eventNames() {
    return Object.keys(this._events);
  }
};
function _addListener(target, type, listener, prepend) {
  _checkListener(listener);
  if (target._events.newListener !== void 0) {
    target.emit("newListener", type, listener.listener || listener);
  }
  if (!target._events[type]) {
    target._events[type] = [];
  }
  if (prepend) {
    target._events[type].unshift(listener);
  } else {
    target._events[type].push(listener);
  }
  const maxListeners = _getMaxListeners(target);
  if (maxListeners > 0 && target._events[type].length > maxListeners && !target._events[type].warned) {
    target._events[type].warned = true;
    const warning = new Error(
      `[unenv] Possible EventEmitter memory leak detected. ${target._events[type].length} ${type} listeners added. Use emitter.setMaxListeners() to increase limit`
    );
    warning.name = "MaxListenersExceededWarning";
    warning.emitter = target;
    warning.type = type;
    warning.count = target._events[type]?.length;
    console.warn(warning);
  }
  return target;
}
function _removeListener(target, type, listener) {
  _checkListener(listener);
  if (!target._events[type] || target._events[type].length === 0) {
    return target;
  }
  const lenBeforeFilter = target._events[type].length;
  target._events[type] = target._events[type].filter((fn) => fn !== listener);
  if (lenBeforeFilter === target._events[type].length) {
    return target;
  }
  if (target._events.removeListener) {
    target.emit("removeListener", type, listener.listener || listener);
  }
  if (target._events[type].length === 0) {
    delete target._events[type];
  }
  return target;
}
function _removeAllListeners(target, type) {
  if (!target._events[type] || target._events[type].length === 0) {
    return target;
  }
  if (target._events.removeListener) {
    for (const _listener of target._events[type]) {
      target.emit("removeListener", type, _listener.listener || _listener);
    }
  }
  delete target._events[type];
  return target;
}
function _wrapOnce(target, type, listener) {
  let fired = false;
  const wrapper = (...args) => {
    if (fired) {
      return;
    }
    target.removeListener(type, wrapper);
    fired = true;
    return args.length === 0 ? listener.call(target) : listener.apply(target, args);
  };
  wrapper.listener = listener;
  return wrapper;
}
function _getMaxListeners(target) {
  return target._maxListeners ?? EventEmitter$1.defaultMaxListeners;
}
function _listeners(target, type, unwrap) {
  let listeners = target._events[type];
  if (typeof listeners === "function") {
    listeners = [listeners];
  }
  return unwrap ? listeners.map((l) => l.listener || l) : listeners;
}
function _checkListener(listener) {
  if (typeof listener !== "function") {
    throw new TypeError(
      'The "listener" argument must be of type Function. Received type ' + typeof listener
    );
  }
}

const EventEmitter = globalThis.EventEmitter || EventEmitter$1;

class _Readable extends EventEmitter {
  __unenv__ = true;
  readableEncoding = null;
  readableEnded = true;
  readableFlowing = false;
  readableHighWaterMark = 0;
  readableLength = 0;
  readableObjectMode = false;
  readableAborted = false;
  readableDidRead = false;
  closed = false;
  errored = null;
  readable = false;
  destroyed = false;
  static from(_iterable, options) {
    return new _Readable(options);
  }
  constructor(_opts) {
    super();
  }
  _read(_size) {
  }
  read(_size) {
  }
  setEncoding(_encoding) {
    return this;
  }
  pause() {
    return this;
  }
  resume() {
    return this;
  }
  isPaused() {
    return true;
  }
  unpipe(_destination) {
    return this;
  }
  unshift(_chunk, _encoding) {
  }
  wrap(_oldStream) {
    return this;
  }
  push(_chunk, _encoding) {
    return false;
  }
  _destroy(_error, _callback) {
    this.removeAllListeners();
  }
  destroy(error) {
    this.destroyed = true;
    this._destroy(error);
    return this;
  }
  pipe(_destenition, _options) {
    return {};
  }
  compose(stream, options) {
    throw new Error("[unenv] Method not implemented.");
  }
  [Symbol.asyncDispose]() {
    this.destroy();
    return Promise.resolve();
  }
  // eslint-disable-next-line require-yield
  async *[Symbol.asyncIterator]() {
    throw createNotImplementedError("Readable.asyncIterator");
  }
  iterator(options) {
    throw createNotImplementedError("Readable.iterator");
  }
  map(fn, options) {
    throw createNotImplementedError("Readable.map");
  }
  filter(fn, options) {
    throw createNotImplementedError("Readable.filter");
  }
  forEach(fn, options) {
    throw createNotImplementedError("Readable.forEach");
  }
  reduce(fn, initialValue, options) {
    throw createNotImplementedError("Readable.reduce");
  }
  find(fn, options) {
    throw createNotImplementedError("Readable.find");
  }
  findIndex(fn, options) {
    throw createNotImplementedError("Readable.findIndex");
  }
  some(fn, options) {
    throw createNotImplementedError("Readable.some");
  }
  toArray(options) {
    throw createNotImplementedError("Readable.toArray");
  }
  every(fn, options) {
    throw createNotImplementedError("Readable.every");
  }
  flatMap(fn, options) {
    throw createNotImplementedError("Readable.flatMap");
  }
  drop(limit, options) {
    throw createNotImplementedError("Readable.drop");
  }
  take(limit, options) {
    throw createNotImplementedError("Readable.take");
  }
  asIndexedPairs(options) {
    throw createNotImplementedError("Readable.asIndexedPairs");
  }
}
const Readable = globalThis.Readable || _Readable;

class _Writable extends EventEmitter {
  __unenv__ = true;
  writable = true;
  writableEnded = false;
  writableFinished = false;
  writableHighWaterMark = 0;
  writableLength = 0;
  writableObjectMode = false;
  writableCorked = 0;
  closed = false;
  errored = null;
  writableNeedDrain = false;
  destroyed = false;
  _data;
  _encoding = "utf-8";
  constructor(_opts) {
    super();
  }
  pipe(_destenition, _options) {
    return {};
  }
  _write(chunk, encoding, callback) {
    if (this.writableEnded) {
      if (callback) {
        callback();
      }
      return;
    }
    if (this._data === void 0) {
      this._data = chunk;
    } else {
      const a = typeof this._data === "string" ? Buffer.from(this._data, this._encoding || encoding || "utf8") : this._data;
      const b = typeof chunk === "string" ? Buffer.from(chunk, encoding || this._encoding || "utf8") : chunk;
      this._data = Buffer.concat([a, b]);
    }
    this._encoding = encoding;
    if (callback) {
      callback();
    }
  }
  _writev(_chunks, _callback) {
  }
  _destroy(_error, _callback) {
  }
  _final(_callback) {
  }
  write(chunk, arg2, arg3) {
    const encoding = typeof arg2 === "string" ? this._encoding : "utf-8";
    const cb = typeof arg2 === "function" ? arg2 : typeof arg3 === "function" ? arg3 : void 0;
    this._write(chunk, encoding, cb);
    return true;
  }
  setDefaultEncoding(_encoding) {
    return this;
  }
  end(arg1, arg2, arg3) {
    const callback = typeof arg1 === "function" ? arg1 : typeof arg2 === "function" ? arg2 : typeof arg3 === "function" ? arg3 : void 0;
    if (this.writableEnded) {
      if (callback) {
        callback();
      }
      return this;
    }
    const data = arg1 === callback ? void 0 : arg1;
    if (data) {
      const encoding = arg2 === callback ? void 0 : arg2;
      this.write(data, encoding, callback);
    }
    this.writableEnded = true;
    this.writableFinished = true;
    this.emit("close");
    this.emit("finish");
    return this;
  }
  cork() {
  }
  uncork() {
  }
  destroy(_error) {
    this.destroyed = true;
    delete this._data;
    this.removeAllListeners();
    return this;
  }
  compose(stream, options) {
    throw new Error("[h3] Method not implemented.");
  }
}
const Writable = globalThis.Writable || _Writable;

const __Duplex = class {
  allowHalfOpen = true;
  _destroy;
  constructor(readable = new Readable(), writable = new Writable()) {
    Object.assign(this, readable);
    Object.assign(this, writable);
    this._destroy = mergeFns(readable._destroy, writable._destroy);
  }
};
function getDuplex() {
  Object.assign(__Duplex.prototype, Readable.prototype);
  Object.assign(__Duplex.prototype, Writable.prototype);
  return __Duplex;
}
const _Duplex = /* @__PURE__ */ getDuplex();
const Duplex = globalThis.Duplex || _Duplex;

class Socket extends Duplex {
  __unenv__ = true;
  bufferSize = 0;
  bytesRead = 0;
  bytesWritten = 0;
  connecting = false;
  destroyed = false;
  pending = false;
  localAddress = "";
  localPort = 0;
  remoteAddress = "";
  remoteFamily = "";
  remotePort = 0;
  autoSelectFamilyAttemptedAddresses = [];
  readyState = "readOnly";
  constructor(_options) {
    super();
  }
  write(_buffer, _arg1, _arg2) {
    return false;
  }
  connect(_arg1, _arg2, _arg3) {
    return this;
  }
  end(_arg1, _arg2, _arg3) {
    return this;
  }
  setEncoding(_encoding) {
    return this;
  }
  pause() {
    return this;
  }
  resume() {
    return this;
  }
  setTimeout(_timeout, _callback) {
    return this;
  }
  setNoDelay(_noDelay) {
    return this;
  }
  setKeepAlive(_enable, _initialDelay) {
    return this;
  }
  address() {
    return {};
  }
  unref() {
    return this;
  }
  ref() {
    return this;
  }
  destroySoon() {
    this.destroy();
  }
  resetAndDestroy() {
    const err = new Error("ERR_SOCKET_CLOSED");
    err.code = "ERR_SOCKET_CLOSED";
    this.destroy(err);
    return this;
  }
}

class IncomingMessage extends Readable {
  __unenv__ = {};
  aborted = false;
  httpVersion = "1.1";
  httpVersionMajor = 1;
  httpVersionMinor = 1;
  complete = true;
  connection;
  socket;
  headers = {};
  trailers = {};
  method = "GET";
  url = "/";
  statusCode = 200;
  statusMessage = "";
  closed = false;
  errored = null;
  readable = false;
  constructor(socket) {
    super();
    this.socket = this.connection = socket || new Socket();
  }
  get rawHeaders() {
    return rawHeaders(this.headers);
  }
  get rawTrailers() {
    return [];
  }
  setTimeout(_msecs, _callback) {
    return this;
  }
  get headersDistinct() {
    return _distinct(this.headers);
  }
  get trailersDistinct() {
    return _distinct(this.trailers);
  }
}
function _distinct(obj) {
  const d = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key) {
      d[key] = (Array.isArray(value) ? value : [value]).filter(
        Boolean
      );
    }
  }
  return d;
}

class ServerResponse extends Writable {
  __unenv__ = true;
  statusCode = 200;
  statusMessage = "";
  upgrading = false;
  chunkedEncoding = false;
  shouldKeepAlive = false;
  useChunkedEncodingByDefault = false;
  sendDate = false;
  finished = false;
  headersSent = false;
  strictContentLength = false;
  connection = null;
  socket = null;
  req;
  _headers = {};
  constructor(req) {
    super();
    this.req = req;
  }
  assignSocket(socket) {
    socket._httpMessage = this;
    this.socket = socket;
    this.connection = socket;
    this.emit("socket", socket);
    this._flush();
  }
  _flush() {
    this.flushHeaders();
  }
  detachSocket(_socket) {
  }
  writeContinue(_callback) {
  }
  writeHead(statusCode, arg1, arg2) {
    if (statusCode) {
      this.statusCode = statusCode;
    }
    if (typeof arg1 === "string") {
      this.statusMessage = arg1;
      arg1 = void 0;
    }
    const headers = arg2 || arg1;
    if (headers) {
      if (Array.isArray(headers)) ; else {
        for (const key in headers) {
          this.setHeader(key, headers[key]);
        }
      }
    }
    this.headersSent = true;
    return this;
  }
  writeProcessing() {
  }
  setTimeout(_msecs, _callback) {
    return this;
  }
  appendHeader(name, value) {
    name = name.toLowerCase();
    const current = this._headers[name];
    const all = [
      ...Array.isArray(current) ? current : [current],
      ...Array.isArray(value) ? value : [value]
    ].filter(Boolean);
    this._headers[name] = all.length > 1 ? all : all[0];
    return this;
  }
  setHeader(name, value) {
    this._headers[name.toLowerCase()] = value;
    return this;
  }
  getHeader(name) {
    return this._headers[name.toLowerCase()];
  }
  getHeaders() {
    return this._headers;
  }
  getHeaderNames() {
    return Object.keys(this._headers);
  }
  hasHeader(name) {
    return name.toLowerCase() in this._headers;
  }
  removeHeader(name) {
    delete this._headers[name.toLowerCase()];
  }
  addTrailers(_headers) {
  }
  flushHeaders() {
  }
  writeEarlyHints(_headers, cb) {
    if (typeof cb === "function") {
      cb();
    }
  }
}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Error extends Error {
  constructor(message, opts = {}) {
    super(message, opts);
    __publicField$2(this, "statusCode", 500);
    __publicField$2(this, "fatal", false);
    __publicField$2(this, "unhandled", false);
    __publicField$2(this, "statusMessage");
    __publicField$2(this, "data");
    __publicField$2(this, "cause");
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
__publicField$2(H3Error, "__h3_error__", true);
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const xForwardedHost = event.node.req.headers["x-forwarded-host"];
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= opts.modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeaders(event) {
  return event.node.res.getHeaders();
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name)) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    for (const [key, value] of Object.entries(input)) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Event {
  constructor(req, res) {
    __publicField(this, "__is_event__", true);
    // Context
    __publicField(this, "node");
    // Node
    __publicField(this, "web");
    // Web
    __publicField(this, "context", {});
    // Shared
    // Request
    __publicField(this, "_method");
    __publicField(this, "_path");
    __publicField(this, "_headers");
    __publicField(this, "_requestBody");
    // Response
    __publicField(this, "_handled", false);
    // Hooks
    __publicField(this, "_onBeforeResponseCalled");
    __publicField(this, "_onAfterResponseCalled");
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

const s=globalThis.Headers,i=globalThis.AbortController,l$1=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses$1 = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch$1(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        context.options.body = typeof context.options.body === "string" ? context.options.body : JSON.stringify(context.options.body);
        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses$1.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch$1({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l$1;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http__default$1.Agent(agentOptions);
  const httpsAgent = new node_https__default.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l$1(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s;
const AbortController$1 = globalThis.AbortController || i;
createFetch$1({ fetch, Headers: Headers$1, AbortController: AbortController$1 });

const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createCall(handle) {
  return function callHandle(context) {
    const req = new IncomingMessage();
    const res = new ServerResponse(req);
    req.url = context.url || "/";
    req.method = context.method || "GET";
    req.headers = {};
    if (context.headers) {
      const headerEntries = typeof context.headers.entries === "function" ? context.headers.entries() : Object.entries(context.headers);
      for (const [name, value] of headerEntries) {
        if (!value) {
          continue;
        }
        req.headers[name.toLowerCase()] = value;
      }
    }
    req.headers.host = req.headers.host || context.host || "localhost";
    req.connection.encrypted = // @ts-ignore
    req.connection.encrypted || context.protocol === "https";
    req.body = context.body || null;
    req.__unenv__ = context.context;
    return handle(req, res).then(() => {
      let body = res._data;
      if (nullBodyResponses.has(res.statusCode) || req.method.toUpperCase() === "HEAD") {
        body = null;
        delete res._headers["content-length"];
      }
      const r = {
        body,
        headers: res._headers,
        status: res.statusCode,
        statusText: res.statusMessage
      };
      req.destroy();
      res.destroy();
      return r;
    });
  };
}

function createFetch(call, _fetch = global.fetch) {
  return async function ufetch(input, init) {
    const url = input.toString();
    if (!url.startsWith("/")) {
      return _fetch(url, init);
    }
    try {
      const r = await call({ url, ...init });
      return new Response(r.body, {
        status: r.status,
        statusText: r.statusText,
        headers: Object.fromEntries(
          Object.entries(r.headers).map(([name, value]) => [
            name,
            Array.isArray(value) ? value.join(",") : String(value) || ""
          ])
        )
      });
    } catch (error) {
      return new Response(error.toString(), {
        status: Number.parseInt(error.statusCode || error.code) || 500,
        statusText: error.statusText
      });
    }
  };
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /{{(.*?)}}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const inlineAppConfig = {};



const appConfig$1 = defuFn(inlineAppConfig);

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {}
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig$1));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
function checkBufferSupport() {
  if (typeof Buffer === "undefined") {
    throw new TypeError("[unstorage] Buffer is not supported!");
  }
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  checkBufferSupport();
  const base64 = Buffer.from(value).toString("base64");
  return BASE64_PREFIX + base64;
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  checkBufferSupport();
  return Buffer.from(value.slice(BASE64_PREFIX.length), "base64");
}

const storageKeyProperties = [
  "hasItem",
  "getItem",
  "getItemRaw",
  "setItem",
  "setItemRaw",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0].replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      for (const mount of mounts) {
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      return base ? allKeys.filter(
        (key) => key.startsWith(base) && key[key.length - 1] !== "$"
      ) : allKeys.filter((key) => key[key.length - 1] !== "$");
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0].replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        const dirFiles = await readdirRecursive(entryPath, ignore);
        files.push(...dirFiles.map((f) => entry.name + "/" + f));
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys() {
      return readdirRecursive(r("."), opts.ignore);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"/Users/phammikun/Development/tssd/apps/web/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[nitro] [cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          const promise = useStorage().setItem(cacheKey, entry).catch((error) => {
            console.error(`[nitro] [cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event && event.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[nitro] [cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length > 0 ? hash(args, {}) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      const _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        variableHeaders[header] = incomingEvent.node.req.headers[header];
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            for (const header in headers2) {
              this.setHeader(header, headers2[header]);
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(event);
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        event.node.res.setHeader(name, value);
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function normalizeError(error) {
  const cwd = typeof process.cwd === "function" ? process.cwd() : "/";
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}
function _captureError(error, type) {
  console.error(`[nitro] [${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als && currentInstance === void 0) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      contexts[key];
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage: AsyncLocalStorage 
});

const appConfig = {"name":"vinxi","routers":[{"name":"public","type":"static","dir":"./public","base":"/","root":"/Users/phammikun/Development/tssd/apps/web","order":0,"outDir":"/Users/phammikun/Development/tssd/apps/web/.vinxi/build/public"},{"name":"client","type":"client","target":"browser","handler":"app/client.tsx","base":"/_build","build":{"sourcemap":true},"root":"/Users/phammikun/Development/tssd/apps/web","outDir":"/Users/phammikun/Development/tssd/apps/web/.vinxi/build/client","order":1},{"name":"api","type":"http","target":"server","base":"/api","handler":"app/api.ts","root":"/Users/phammikun/Development/tssd/apps/web","outDir":"/Users/phammikun/Development/tssd/apps/web/.vinxi/build/api","order":2},{"name":"ssr","type":"http","target":"server","handler":"app/ssr.tsx","link":{"client":"client"},"root":"/Users/phammikun/Development/tssd/apps/web","base":"/","outDir":"/Users/phammikun/Development/tssd/apps/web/.vinxi/build/ssr","order":3},{"name":"server","type":"http","target":"server","base":"/_server","handler":"../../node_modules/.pnpm/@tanstack+start@1.77.0_@types+node@22.8.1_ioredis@5.4.1_react-dom@18.3.1_react@18.3.1__react@_o3ao2rqg4tjbieylztoc3te5eq/node_modules/@tanstack/start/dist/esm/server-handler/index.js","root":"/Users/phammikun/Development/tssd/apps/web","outDir":"/Users/phammikun/Development/tssd/apps/web/.vinxi/build/server","order":4}],"server":{"preset":"node-server","experimental":{"asyncContext":true}},"root":"/Users/phammikun/Development/tssd/apps/web"};
				const buildManifest = {"client":{"_client-BBEbIahw.js":{"file":"assets/client-BBEbIahw.js","name":"client","dynamicImports":["app/routes/index.tsx?tsr-split","app/routes/index.tsx?tsr-split"]},"app/routes/index.tsx?tsr-split":{"file":"assets/index-JL9gITWW.js","name":"index","src":"app/routes/index.tsx?tsr-split","isDynamicEntry":true,"imports":["_client-BBEbIahw.js"]},"virtual:$vinxi/handler/client":{"file":"assets/client-DRwj4wGm.js","name":"client","src":"virtual:$vinxi/handler/client","isEntry":true,"imports":["_client-BBEbIahw.js"]}},"api":{"_index-DcfUkDyR.js":{"file":"assets/index-DcfUkDyR.js","name":"index","dynamicImports":["app/routes/api/users.ts?pick=Route","app/routes/api/users.ts?pick=Route"]},"app/routes/api/users.ts?pick=Route":{"file":"users.js","name":"users","src":"app/routes/api/users.ts?pick=Route","isEntry":true,"isDynamicEntry":true,"imports":["_index-DcfUkDyR.js"]},"virtual:$vinxi/handler/api":{"file":"api.js","name":"api","src":"virtual:$vinxi/handler/api","isEntry":true,"imports":["_index-DcfUkDyR.js"]}},"ssr":{"_ssr-Cxa6HcOB.js":{"file":"assets/ssr-Cxa6HcOB.js","name":"ssr","dynamicImports":["app/routes/index.tsx?tsr-split","app/routes/index.tsx?tsr-split"]},"app/routes/index.tsx?tsr-split":{"file":"assets/index-2rfRUrNU.js","name":"index","src":"app/routes/index.tsx?tsr-split","isDynamicEntry":true,"imports":["_ssr-Cxa6HcOB.js"]},"virtual:$vinxi/handler/ssr":{"file":"ssr.js","name":"ssr","src":"virtual:$vinxi/handler/ssr","isEntry":true,"imports":["_ssr-Cxa6HcOB.js"]}},"server":{"_tiny-invariant.mjs":{"file":"tiny-invariant.mjs","name":"tiny-invariant"},"app/routes/index.tsx?tsr-split":{"file":"c_7oungc.mjs","name":"c_7oungc","src":"app/routes/index.tsx?tsr-split","isEntry":true,"imports":["_tiny-invariant.mjs"]},"virtual:$vinxi/handler/server":{"file":"entry.mjs","name":"entry","src":"virtual:$vinxi/handler/server","isEntry":true,"imports":["_tiny-invariant.mjs"]}}};

				const routeManifest = {"api":{}};

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest, routeManifest },
            getRouter(name) {
              return appConfig.routers.find(router => router.name === name)
            }
          }
        }

        function plugin$2(app) {
          const prodApp = createProdApp(appConfig);
          globalThis.app = prodApp;
        }

function plugin$1(app) {
	globalThis.$handle = (event) => app.h3App.handler(event);
}

/**
 * Traverses the module graph and collects assets for a given chunk
 *
 * @param {any} manifest Client manifest
 * @param {string} id Chunk id
 * @param {Map<string, string[]>} assetMap Cache of assets
 * @param {string[]} stack Stack of chunk ids to prevent circular dependencies
 * @returns Array of asset URLs
 */
function findAssetsInViteManifest(manifest, id, assetMap = new Map(), stack = []) {
	if (stack.includes(id)) {
		return [];
	}

	const cached = assetMap.get(id);
	if (cached) {
		return cached;
	}
	const chunk = manifest[id];
	if (!chunk) {
		return [];
	}

	const assets = [
		...(chunk.assets?.filter(Boolean) || []),
		...(chunk.css?.filter(Boolean) || [])
	];
	if (chunk.imports) {
		stack.push(id);
		for (let i = 0, l = chunk.imports.length; i < l; i++) {
			assets.push(...findAssetsInViteManifest(manifest, chunk.imports[i], assetMap, stack));
		}
		stack.pop();
	}
	assets.push(chunk.file);
	const all = Array.from(new Set(assets));
	assetMap.set(id, all);

	return all;
}

/** @typedef {import("../app.js").App & { config: { buildManifest: { [key:string]: any } }}} ProdApp */

function createHtmlTagsForAssets(router, app, assets) {
	return assets
		.filter(
			(asset) =>
				asset.endsWith(".css") ||
				asset.endsWith(".js") ||
				asset.endsWith(".mjs"),
		)
		.map((asset) => ({
			tag: "link",
			attrs: {
				href: joinURL(app.config.server.baseURL ?? "/", router.base, asset),
				key: join$1(app.config.server.baseURL ?? "", router.base, asset),
				...(asset.endsWith(".css")
					? { rel: "stylesheet", fetchPriority: "high" }
					: { rel: "modulepreload" }),
			},
		}));
}

/**
 *
 * @param {ProdApp} app
 * @returns
 */
function createProdManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, routerName) {
				invariant(typeof routerName === "string", "Bundler name expected");
				const router = app.getRouter(routerName);
				const bundlerManifest = app.config.buildManifest[routerName];

				invariant(
					router.type !== "static",
					"manifest not available for static router",
				);
				return {
					handler: router.handler,
					async assets() {
						/** @type {{ [key: string]: string[] }} */
						let assets = {};
						assets[router.handler] = await this.inputs[router.handler].assets();
						for (const route of (await router.internals.routes?.getRoutes()) ??
							[]) {
							assets[route.filePath] = await this.inputs[
								route.filePath
							].assets();
						}
						return assets;
					},
					async routes() {
						return (await router.internals.routes?.getRoutes()) ?? [];
					},
					async json() {
						/** @type {{ [key: string]: { output: string; assets: string[]} }} */
						let json = {};
						for (const input of Object.keys(this.inputs)) {
							json[input] = {
								output: this.inputs[input].output.path,
								assets: await this.inputs[input].assets(),
							};
						}
						return json;
					},
					chunks: new Proxy(
						{},
						{
							get(target, chunk) {
								invariant(typeof chunk === "string", "Chunk expected");
								const chunkPath = join$1(
									router.outDir,
									router.base,
									chunk + ".mjs",
								);
								return {
									import() {
										if (globalThis.$$chunks[chunk + ".mjs"]) {
											return globalThis.$$chunks[chunk + ".mjs"];
										}
										return import(
											/* @vite-ignore */ pathToFileURL(chunkPath).href
										);
									},
									output: {
										path: chunkPath,
									},
								};
							},
						},
					),
					inputs: new Proxy(
						{},
						{
							ownKeys(target) {
								const keys = Object.keys(bundlerManifest)
									.filter((id) => bundlerManifest[id].isEntry)
									.map((id) => id);
								return keys;
							},
							getOwnPropertyDescriptor(k) {
								return {
									enumerable: true,
									configurable: true,
								};
							},
							get(target, input) {
								invariant(typeof input === "string", "Input expected");
								if (router.target === "server") {
									const id =
										input === router.handler
											? virtualId(handlerModule(router))
											: input;
									return {
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: join$1(
												router.outDir,
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								} else if (router.target === "browser") {
									const id =
										input === router.handler && !input.endsWith(".html")
											? virtualId(handlerModule(router))
											: input;
									return {
										import() {
											return import(
												/* @vite-ignore */ joinURL(
													app.config.server.baseURL ?? "",
													router.base,
													bundlerManifest[id].file,
												)
											);
										},
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: joinURL(
												app.config.server.baseURL ?? "",
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								}
							},
						},
					),
				};
			},
		},
	);

	return manifest;
}

function plugin() {
	globalThis.MANIFEST =
		createProdManifest(globalThis.app)
			;
}

var a$1="Invariant failed";function n(r,i){if(!r)throw new Error(a$1)}

function Er(t,e,i){return Object.assign(t,{url:"https://localhost:3000"})}const Ar=createEnv({client:{},server:{DATABASE_URL:z$3.string().url()},runtimeEnv:{DATABASE_URL:process.env.DATABASE_URL}});function oe$1(t){return typeof t>"u"||t===void 0}function E$2(t){return typeof t=="string"}function Ct$1(t){return typeof t=="number"}function Nt$1(t){return typeof t=="boolean"}function Qt$1(t){return t===null}function Lr(t){return t instanceof Date}function Bt$1(t){return typeof t=="bigint"}function A$1(t){return typeof t=="function"}function $$2(t){return typeof t=="object"&&t!==null}function r(t){return Object.freeze(t)}function ht$1(t){return _(t)?t:[t]}function _(t){return Array.isArray(t)}function ae(t){return t}const c=r({is(t){return t.kind==="AlterTableNode"},create(t){return r({kind:"AlterTableNode",table:t})},cloneWithTableProps(t,e){return r({...t,...e})},cloneWithColumnAlteration(t,e){return r({...t,columnAlterations:t.columnAlterations?[...t.columnAlterations,e]:[e]})}}),w$2=r({is(t){return t.kind==="IdentifierNode"},create(t){return r({kind:"IdentifierNode",name:t})}}),X$2=r({is(t){return t.kind==="CreateIndexNode"},create(t){return r({kind:"CreateIndexNode",name:w$2.create(t)})},cloneWith(t,e){return r({...t,...e})},cloneWithColumns(t,e){return r({...t,columns:[...t.columns||[],...e]})}}),Ai=r({is(t){return t.kind==="CreateSchemaNode"},create(t,e){return r({kind:"CreateSchemaNode",schema:w$2.create(t),...e})},cloneWith(t,e){return r({...t,...e})}}),Rr=["preserve rows","delete rows","drop"],R$3=r({is(t){return t.kind==="CreateTableNode"},create(t){return r({kind:"CreateTableNode",table:t,columns:r([])})},cloneWithColumn(t,e){return r({...t,columns:r([...t.columns,e])})},cloneWithConstraint(t,e){return r({...t,constraints:t.constraints?r([...t.constraints,e]):r([e])})},cloneWithFrontModifier(t,e){return r({...t,frontModifiers:t.frontModifiers?r([...t.frontModifiers,e]):r([e])})},cloneWithEndModifier(t,e){return r({...t,endModifiers:t.endModifiers?r([...t.endModifiers,e]):r([e])})},cloneWith(t,e){return r({...t,...e})}}),ue=r({is(t){return t.kind==="SchemableIdentifierNode"},create(t){return r({kind:"SchemableIdentifierNode",identifier:w$2.create(t)})},createWithSchema(t,e){return r({kind:"SchemableIdentifierNode",schema:w$2.create(t),identifier:w$2.create(e)})}}),Ue$1=r({is(t){return t.kind==="DropIndexNode"},create(t,e){return r({kind:"DropIndexNode",name:ue.create(t),...e})},cloneWith(t,e){return r({...t,...e})}}),Pt$1=r({is(t){return t.kind==="DropSchemaNode"},create(t,e){return r({kind:"DropSchemaNode",schema:w$2.create(t),...e})},cloneWith(t,e){return r({...t,...e})}}),Mt$1=r({is(t){return t.kind==="DropTableNode"},create(t,e){return r({kind:"DropTableNode",table:t,...e})},cloneWith(t,e){return r({...t,...e})}}),le=r({is(t){return t.kind==="AliasNode"},create(t,e){return r({kind:"AliasNode",node:t,alias:e})}}),he=r({is(t){return t.kind==="TableNode"},create(t){return r({kind:"TableNode",table:ue.create(t)})},createWithSchema(t,e){return r({kind:"TableNode",table:ue.createWithSchema(t,e)})}});function L$2(t){return $$2(t)&&A$1(t.toOperationNode)}function Dr(t){return $$2(t)&&"expressionType"in t&&L$2(t)}function Pr(t){return $$2(t)&&"expression"in t&&E$2(t.alias)&&L$2(t)}const Y$1=r({is(t){return t.kind==="SelectModifierNode"},create(t,e){return r({kind:"SelectModifierNode",modifier:t,of:e})},createWithExpression(t){return r({kind:"SelectModifierNode",rawModifier:t})}}),de=r({is(t){return t.kind==="AndNode"},create(t,e){return r({kind:"AndNode",left:t,right:e})}}),Me=r({is(t){return t.kind==="OrNode"},create(t,e){return r({kind:"OrNode",left:t,right:e})}}),Rt$1=r({is(t){return t.kind==="OnNode"},create(t){return r({kind:"OnNode",on:t})},cloneWithOperation(t,e,i){return r({...t,on:e==="And"?de.create(t.on,i):Me.create(t.on,i)})}}),$e=r({is(t){return t.kind==="JoinNode"},create(t,e){return r({kind:"JoinNode",joinType:t,table:e,on:void 0})},createWithOn(t,e,i){return r({kind:"JoinNode",joinType:t,table:e,on:Rt$1.create(i)})},cloneWithOn(t,e){return r({...t,on:t.on?Rt$1.cloneWithOperation(t.on,"And",e):Rt$1.create(e)})}}),Le=r({is(t){return t.kind==="BinaryOperationNode"},create(t,e,i){return r({kind:"BinaryOperationNode",leftOperand:t,operator:e,rightOperand:i})}}),Mr=["=","==","!=","<>",">",">=","<","<=","in","not in","is","is not","like","not like","match","ilike","not ilike","@>","<@","^@","&&","?","?&","?|","!<","!>","<=>","!~","~","~*","!~*","@@","@@@","!!","<->","regexp","is distinct from","is not distinct from"],Fr=["+","-","*","/","%","^","&","|","#","<<",">>"],Li=["->","->>"],Jr=[...Mr,...Fr,"&&","||"],Vr=["exists","not exists"],Ur=["not","-",...Vr],$r=[...Jr,...Li,...Ur,"between","between symmetric"],ce=r({is(t){return t.kind==="OperatorNode"},create(t){return r({kind:"OperatorNode",operator:t})}});function ai(t){return E$2(t)&&Li.includes(t)}const O$1=r({is(t){return t.kind==="ColumnNode"},create(t){return r({kind:"ColumnNode",column:w$2.create(t)})}}),jt$1=r({is(t){return t.kind==="SelectAllNode"},create(){return r({kind:"SelectAllNode"})}}),kt$1=r({is(t){return t.kind==="ReferenceNode"},create(t,e){return r({kind:"ReferenceNode",table:e,column:t})},createSelectAll(t){return r({kind:"ReferenceNode",table:t,column:jt$1.create()})}});class Qr{#e;get dynamicReference(){return this.#e}get refType(){}constructor(e){this.#e=e;}toOperationNode(){return Fi(this.#e)}}function Ri(t){return $$2(t)&&L$2(t)&&E$2(t.dynamicReference)}const Ft$1=r({is(t){return t.kind==="OrderByItemNode"},create(t,e){return r({kind:"OrderByItemNode",orderBy:t,direction:e})}}),b$2=r({is(t){return t.kind==="RawNode"},create(t,e){return r({kind:"RawNode",sqlFragments:r(t),parameters:r(e)})},createWithSql(t){return b$2.create([t],[])},createWithChild(t){return b$2.create(["",""],[t])},createWithChildren(t){return b$2.create(new Array(t.length+1).fill(""),t)}});function Di(t){return t==="asc"||t==="desc"}function Tt$1(t){if(t.length===2)return [Dt$1(t[0],t[1])];if(t.length===1){const[e]=t;return Array.isArray(e)?e.map(i=>Dt$1(i)):[Dt$1(e)]}throw new Error(`Invalid number of arguments at order by! expected 1-2, received ${t.length}`)}function Dt$1(t,e){const i=Br(t);if(Ft$1.is(i)){if(e)throw new Error("Cannot specify direction twice!");return i}return Ft$1.create(i,Pi(e))}function Br(t){if(ot$1(t))return we(t);if(Ri(t))return t.toOperationNode();const[e,i]=t.split(" ");if(i){if(!Di(i))throw new Error(`Invalid order by direction: ${i}`);return Ft$1.create(ee$1(e),Pi(i))}return ee$1(t)}function Pi(t){if(t)return t==="asc"||t==="desc"?b$2.createWithSql(t):t.toOperationNode()}const yt$1=r({is(t){return t.kind==="JSONReferenceNode"},create(t,e){return r({kind:"JSONReferenceNode",reference:t,traversal:e})},cloneWithTraversal(t,e){return r({...t,traversal:e})}}),Mi=r({is(t){return t.kind==="JSONOperatorChainNode"},create(t){return r({kind:"JSONOperatorChainNode",operator:t,values:r([])})},cloneWithValue(t,e){return r({...t,values:r([...t.values,e])})}}),Qe$1=r({is(t){return t.kind==="JSONPathNode"},create(t){return r({kind:"JSONPathNode",inOperator:t,pathLegs:r([])})},cloneWithLeg(t,e){return r({...t,pathLegs:r([...t.pathLegs,e])})}});function Fi(t){return E$2(t)?ee$1(t):t.toOperationNode()}function ze$1(t){return _(t)?t.map(e=>M$3(e)):[M$3(t)]}function M$3(t){return ot$1(t)?we(t):Fi(t)}function jr(t,e){const i=ee$1(t);if(ai(e))return yt$1.create(i,Mi.create(ce.create(e)));const n=e.slice(0,-1);if(ai(n))return yt$1.create(i,Qe$1.create(ce.create(n)));throw new Error(`Invalid JSON operator: ${e}`)}function ee$1(t){const e=".";if(!t.includes(e))return kt$1.create(O$1.create(t));const i=t.split(e).map(Kt$1);if(i.length===3)return Gr(i);if(i.length===2)return zr(i);throw new Error(`invalid column reference ${t}`)}function Kr(t){const e=" as ";if(t.includes(e)){const[i,n]=t.split(e).map(Kt$1);return le.create(ee$1(i),w$2.create(n))}else return ee$1(t)}function Ji(t){return O$1.create(t)}function wt$1(t){const e=" ";if(t.includes(e)){const[i,n]=t.split(e).map(Kt$1);if(!Di(n))throw new Error(`invalid order direction "${n}" next to "${i}"`);return Tt$1([i,n])[0]}else return Ji(t)}function Gr(t){const[e,i,n]=t;return kt$1.create(O$1.create(n),he.createWithSchema(e,i))}function zr(t){const[e,i]=t;return kt$1.create(O$1.create(i),he.create(e))}function Kt$1(t){return t.trim()}const Vi=r({is(t){return t.kind==="PrimitiveValueListNode"},create(t){return r({kind:"PrimitiveValueListNode",values:r([...t])})}}),Gt$1=r({is(t){return t.kind==="ValueListNode"},create(t){return r({kind:"ValueListNode",values:r(t)})}}),K$2=r({is(t){return t.kind==="ValueNode"},create(t){return r({kind:"ValueNode",value:t})},createImmediate(t){return r({kind:"ValueNode",value:t,immediate:!0})}});function Hr(t){return _(t)?Yr(t):W$3(t)}function W$3(t){return ot$1(t)?we(t):K$2.create(t)}function zt$1(t){return Ct$1(t)||Nt$1(t)||Qt$1(t)}function Ht$1(t){if(!zt$1(t))throw new Error(`unsafe immediate value ${JSON.stringify(t)}`);return K$2.createImmediate(t)}function Yr(t){return t.some(ot$1)?Gt$1.create(t.map(e=>W$3(e))):Vi.create(t)}const Re=r({is(t){return t.kind==="ParensNode"},create(t){return r({kind:"ParensNode",node:t})}});function q$3(t){if(t.length===3)return Yt$1(t[0],t[1],t[2]);if(t.length===1)return W$3(t[0]);throw new Error(`invalid arguments: ${JSON.stringify(t)}`)}function Yt$1(t,e,i){return Xr(e)&&Ui(i)?Le.create(M$3(t),Jt$1(e),K$2.createImmediate(i)):Le.create(M$3(t),Jt$1(e),Hr(i))}function G$2(t,e,i){return Le.create(M$3(t),Jt$1(e),M$3(i))}function hi(t,e){return gt$1(Object.entries(t).filter(([,i])=>!oe$1(i)).map(([i,n])=>Yt$1(i,Ui(n)?"is":"=",n)),e)}function gt$1(t,e,i=!0){const n=e==="and"?de.create:Me.create;if(t.length===0)return Le.create(K$2.createImmediate(1),ce.create("="),K$2.createImmediate(e==="and"?1:0));let s=ui(t[0]);for(let o=1;o<t.length;++o)s=n(s,ui(t[o]));return t.length>1&&i?Re.create(s):s}function Xr(t){return t==="is"||t==="is not"}function Ui(t){return Qt$1(t)||Nt$1(t)}function Jt$1(t){if(E$2(t)&&$r.includes(t))return ce.create(t);if(L$2(t))return t.toOperationNode();throw new Error(`invalid operator ${JSON.stringify(t)}`)}function ui(t){return L$2(t)?t.toOperationNode():t}const De=r({is(t){return t.kind==="OrderByNode"},create(t){return r({kind:"OrderByNode",items:r([...t])})},cloneWithItems(t,e){return r({...t,items:r([...t.items,...e])})}}),di=r({is(t){return t.kind==="PartitionByNode"},create(t){return r({kind:"PartitionByNode",items:r(t)})},cloneWithItems(t,e){return r({...t,items:r([...t.items,...e])})}}),Vt$1=r({is(t){return t.kind==="OverNode"},create(){return r({kind:"OverNode"})},cloneWithOrderByItems(t,e){return r({...t,orderBy:t.orderBy?De.cloneWithItems(t.orderBy,e):De.create(e)})},cloneWithPartitionByItems(t,e){return r({...t,partitionBy:t.partitionBy?di.cloneWithItems(t.partitionBy,e):di.create(e)})}}),xt$1=r({is(t){return t.kind==="FromNode"},create(t){return r({kind:"FromNode",froms:r(t)})},cloneWithFroms(t,e){return r({...t,froms:r([...t.froms,...e])})}}),ci=r({is(t){return t.kind==="GroupByNode"},create(t){return r({kind:"GroupByNode",items:r(t)})},cloneWithItems(t,e){return r({...t,items:r([...t.items,...e])})}}),li=r({is(t){return t.kind==="HavingNode"},create(t){return r({kind:"HavingNode",having:t})},cloneWithOperation(t,e,i){return r({...t,having:e==="And"?de.create(t.having,i):Me.create(t.having,i)})}}),d$1=r({is(t){return t.kind==="SelectQueryNode"},create(t){return r({kind:"SelectQueryNode",...t&&{with:t}})},createFrom(t,e){return r({kind:"SelectQueryNode",from:xt$1.create(t),...e&&{with:e}})},cloneWithSelections(t,e){return r({...t,selections:t.selections?r([...t.selections,...e]):r(e)})},cloneWithDistinctOn(t,e){return r({...t,distinctOn:t.distinctOn?r([...t.distinctOn,...e]):r(e)})},cloneWithFrontModifier(t,e){return r({...t,frontModifiers:t.frontModifiers?r([...t.frontModifiers,e]):r([e])})},cloneWithEndModifier(t,e){return r({...t,endModifiers:t.endModifiers?r([...t.endModifiers,e]):r([e])})},cloneWithOrderByItems(t,e){return r({...t,orderBy:t.orderBy?De.cloneWithItems(t.orderBy,e):De.create(e)})},cloneWithGroupByItems(t,e){return r({...t,groupBy:t.groupBy?ci.cloneWithItems(t.groupBy,e):ci.create(e)})},cloneWithLimit(t,e){return r({...t,limit:e})},cloneWithOffset(t,e){return r({...t,offset:e})},cloneWithFetch(t,e){return r({...t,fetch:e})},cloneWithHaving(t,e){return r({...t,having:t.having?li.cloneWithOperation(t.having,"And",e):li.create(e)})},cloneWithSetOperations(t,e){return r({...t,setOperations:t.setOperations?r([...t.setOperations,...e]):r([...e])})},cloneWithoutSelections(t){return r({...t,selections:[]})},cloneWithoutLimit(t){return r({...t,limit:void 0})},cloneWithoutOffset(t){return r({...t,offset:void 0})},cloneWithoutOrderBy(t){return r({...t,orderBy:void 0})},cloneWithoutGroupBy(t){return r({...t,groupBy:void 0})}});function u(t,e){Object.defineProperties(t.prototype,{then:{enumerable:!1,value:()=>{throw new Error(e)}}});}class be{#e;constructor(e){this.#e=r(e);}on(...e){return new be({...this.#e,joinNode:$e.cloneWithOn(this.#e.joinNode,q$3(e))})}onRef(e,i,n){return new be({...this.#e,joinNode:$e.cloneWithOn(this.#e.joinNode,G$2(e,i,n))})}onTrue(){return new be({...this.#e,joinNode:$e.cloneWithOn(this.#e.joinNode,b$2.createWithSql("true"))})}$call(e){return e(this)}toOperationNode(){return this.#e.joinNode}}u(be,"don't await JoinBuilder instances. They are never executed directly and are always just a part of a query.");const Zr=r({is(t){return t.kind==="PartitionByItemNode"},create(t){return r({kind:"PartitionByItemNode",partitionBy:t})}});function _r$1(t){return ze$1(t).map(Zr.create)}class He{#e;constructor(e){this.#e=r(e);}orderBy(e,i){return new He({overNode:Vt$1.cloneWithOrderByItems(this.#e.overNode,Tt$1([e,i]))})}partitionBy(e){return new He({overNode:Vt$1.cloneWithPartitionByItems(this.#e.overNode,_r$1(e))})}$call(e){return e(this)}toOperationNode(){return this.#e.overNode}}u(He,"don't await OverBuilder instances. They are never executed directly and are always just a part of a query.");const Be$1=r({is(t){return t.kind==="SelectionNode"},create(t){return r({kind:"SelectionNode",selection:t})},createSelectAll(){return r({kind:"SelectionNode",selection:jt$1.create()})},createSelectAllFromTable(t){return r({kind:"SelectionNode",selection:kt$1.createSelectAll(t)})}});function Q$2(t){return A$1(t)?Q$2(t(Je$1())):_(t)?t.map(e=>pi(e)):[pi(t)]}function pi(t){return E$2(t)?Be$1.create(Kr(t)):Ri(t)?Be$1.create(t.toOperationNode()):Be$1.create(er$1(t))}function z$2(t){return t?Array.isArray(t)?t.map(fi):[fi(t)]:[Be$1.createSelectAll()]}function fi(t){if(E$2(t))return Be$1.createSelectAllFromTable(v$2(t));throw new Error(`invalid value selectAll expression: ${JSON.stringify(t)}`)}const en=r({is(t){return t.kind==="ValuesNode"},create(t){return r({kind:"ValuesNode",values:r(t)})}}),tn=r({is(t){return t.kind==="DefaultInsertValueNode"},create(){return r({kind:"DefaultInsertValueNode"})}});function $i(t){const e=A$1(t)?t(Je$1()):t,i=_(e)?e:r([e]);return rn(i)}function rn(t){const e=nn(t);return [r([...e.keys()].map(O$1.create)),en.create(t.map(i=>sn(i,e)))]}function nn(t){const e=new Map;for(const i of t){const n=Object.keys(i);for(const s of n)!e.has(s)&&i[s]!==void 0&&e.set(s,e.size);}return e}function sn(t,e){const i=Object.keys(t),n=Array.from({length:e.size});let s=!1;for(const x of i){const C=e.get(x);if(oe$1(C))continue;const H=t[x];(oe$1(H)||ot$1(H))&&(s=!0),n[C]=H;}if(i.length<e.size||s){const x=tn.create();return Gt$1.create(n.map(C=>oe$1(C)?x:W$3(C)))}return Vi.create(n)}const P$1=r({is(t){return t.kind==="InsertQueryNode"},create(t,e,i){return r({kind:"InsertQueryNode",into:t,...e&&{with:e},replace:i})},createWithoutInto(){return r({kind:"InsertQueryNode"})},cloneWith(t,e){return r({...t,...e})}}),qe=r({is(t){return t.kind==="UpdateQueryNode"},create(t,e){return r({kind:"UpdateQueryNode",table:t,...e&&{with:e}})},createWithoutTable(){return r({kind:"UpdateQueryNode"})},cloneWithFromItems(t,e){return r({...t,from:t.from?xt$1.cloneWithFroms(t.from,e):xt$1.create(e)})},cloneWithUpdates(t,e){return r({...t,updates:t.updates?r([...t.updates,...e]):e})},cloneWithLimit(t,e){return r({...t,limit:e})}}),mi=r({is(t){return t.kind==="UsingNode"},create(t){return r({kind:"UsingNode",tables:r(t)})},cloneWithTables(t,e){return r({...t,tables:r([...t.tables,...e])})}}),fe=r({is(t){return t.kind==="DeleteQueryNode"},create(t,e){return r({kind:"DeleteQueryNode",from:xt$1.create(t),...e&&{with:e}})},cloneWithOrderByItems(t,e){return r({...t,orderBy:t.orderBy?De.cloneWithItems(t.orderBy,e):De.create(e)})},cloneWithoutOrderBy(t){return r({...t,orderBy:void 0})},cloneWithLimit(t,e){return r({...t,limit:e})},cloneWithoutLimit(t){return r({...t,limit:void 0})},cloneWithUsing(t,e){return r({...t,using:t.using!==void 0?mi.cloneWithTables(t.using,e):mi.create(e)})}}),I$1=r({is(t){return t.kind==="WhereNode"},create(t){return r({kind:"WhereNode",where:t})},cloneWithOperation(t,e,i){return r({...t,where:e==="And"?de.create(t.where,i):Me.create(t.where,i)})}}),Ni=r({is(t){return t.kind==="ReturningNode"},create(t){return r({kind:"ReturningNode",selections:r(t)})},cloneWithSelections(t,e){return r({...t,selections:t.selections?r([...t.selections,...e]):r(e)})}}),on=r({is(t){return t.kind==="ExplainNode"},create(t,e){return r({kind:"ExplainNode",format:t,options:e})}}),it$1=r({is(t){return t.kind==="WhenNode"},create(t){return r({kind:"WhenNode",condition:t})},cloneWithResult(t,e){return r({...t,result:e})}}),S$2=r({is(t){return t.kind==="MergeQueryNode"},create(t,e){return r({kind:"MergeQueryNode",into:t,...e&&{with:e}})},cloneWithUsing(t,e){return r({...t,using:e})},cloneWithWhen(t,e){return r({...t,whens:t.whens?r([...t.whens,e]):r([e])})},cloneWithThen(t,e){return r({...t,whens:t.whens?r([...t.whens.slice(0,-1),it$1.cloneWithResult(t.whens[t.whens.length-1],e)]):void 0})}}),yi=r({is(t){return t.kind==="OutputNode"},create(t){return r({kind:"OutputNode",selections:r(t)})},cloneWithSelections(t,e){return r({...t,selections:t.selections?r([...t.selections,...e]):r(e)})}}),a=r({is(t){return d$1.is(t)||P$1.is(t)||qe.is(t)||fe.is(t)||S$2.is(t)},cloneWithWhere(t,e){return r({...t,where:t.where?I$1.cloneWithOperation(t.where,"And",e):I$1.create(e)})},cloneWithJoin(t,e){return r({...t,joins:t.joins?r([...t.joins,e]):r([e])})},cloneWithReturning(t,e){return r({...t,returning:t.returning?Ni.cloneWithSelections(t.returning,e):Ni.create(e)})},cloneWithoutReturning(t){return r({...t,returning:void 0})},cloneWithoutWhere(t){return r({...t,where:void 0})},cloneWithExplain(t,e,i){return r({...t,explain:on.create(e,i?.toOperationNode())})},cloneWithTop(t,e){return r({...t,top:e})},cloneWithOutput(t,e){return r({...t,output:t.output?yi.cloneWithSelections(t.output,e):yi.create(e)})}}),Qi=r({is(t){return t.kind==="ColumnUpdateNode"},create(t,e){return r({kind:"ColumnUpdateNode",column:t,value:e})}});function an(...t){return t.length===2?[Qi.create(M$3(t[0]),W$3(t[1]))]:Xt$1(t[0])}function Xt$1(t){const e=A$1(t)?t(Je$1()):t;return Object.entries(e).filter(([i,n])=>n!==void 0).map(([i,n])=>Qi.create(O$1.create(i),W$3(n)))}const hn=r({is(t){return t.kind==="OnDuplicateKeyNode"},create(t){return r({kind:"OnDuplicateKeyNode",updates:t})}});class un{insertId;numInsertedOrUpdatedRows;constructor(e,i){this.insertId=e,this.numInsertedOrUpdatedRows=i;}}let rt$1 = class rt extends Error{node;constructor(e){super("no result"),this.node=e;}};function nt$1(t){return Object.prototype.hasOwnProperty.call(t,"prototype")}const D$3=r({is(t){return t.kind==="OnConflictNode"},create(){return r({kind:"OnConflictNode"})},cloneWith(t,e){return r({...t,...e})},cloneWithIndexWhere(t,e){return r({...t,indexWhere:t.indexWhere?I$1.cloneWithOperation(t.indexWhere,"And",e):I$1.create(e)})},cloneWithIndexOrWhere(t,e){return r({...t,indexWhere:t.indexWhere?I$1.cloneWithOperation(t.indexWhere,"Or",e):I$1.create(e)})},cloneWithUpdateWhere(t,e){return r({...t,updateWhere:t.updateWhere?I$1.cloneWithOperation(t.updateWhere,"And",e):I$1.create(e)})},cloneWithUpdateOrWhere(t,e){return r({...t,updateWhere:t.updateWhere?I$1.cloneWithOperation(t.updateWhere,"Or",e):I$1.create(e)})},cloneWithoutIndexWhere(t){return r({...t,indexWhere:void 0})},cloneWithoutUpdateWhere(t){return r({...t,updateWhere:void 0})}});let B$2 = class B{#e;constructor(e){this.#e=r(e);}column(e){const i=O$1.create(e);return new B({...this.#e,onConflictNode:D$3.cloneWith(this.#e.onConflictNode,{columns:this.#e.onConflictNode.columns?r([...this.#e.onConflictNode.columns,i]):r([i])})})}columns(e){const i=e.map(O$1.create);return new B({...this.#e,onConflictNode:D$3.cloneWith(this.#e.onConflictNode,{columns:this.#e.onConflictNode.columns?r([...this.#e.onConflictNode.columns,...i]):r(i)})})}constraint(e){return new B({...this.#e,onConflictNode:D$3.cloneWith(this.#e.onConflictNode,{constraint:w$2.create(e)})})}expression(e){return new B({...this.#e,onConflictNode:D$3.cloneWith(this.#e.onConflictNode,{indexExpression:e.toOperationNode()})})}where(...e){return new B({...this.#e,onConflictNode:D$3.cloneWithIndexWhere(this.#e.onConflictNode,q$3(e))})}whereRef(e,i,n){return new B({...this.#e,onConflictNode:D$3.cloneWithIndexWhere(this.#e.onConflictNode,G$2(e,i,n))})}clearWhere(){return new B({...this.#e,onConflictNode:D$3.cloneWithoutIndexWhere(this.#e.onConflictNode)})}doNothing(){return new Bi({...this.#e,onConflictNode:D$3.cloneWith(this.#e.onConflictNode,{doNothing:!0})})}doUpdateSet(e){return new Ce({...this.#e,onConflictNode:D$3.cloneWith(this.#e.onConflictNode,{updates:Xt$1(e)})})}$call(e){return e(this)}};u(B$2,"don't await OnConflictBuilder instances.");class Bi{#e;constructor(e){this.#e=r(e);}toOperationNode(){return this.#e.onConflictNode}}u(Bi,"don't await OnConflictDoNothingBuilder instances.");class Ce{#e;constructor(e){this.#e=r(e);}where(...e){return new Ce({...this.#e,onConflictNode:D$3.cloneWithUpdateWhere(this.#e.onConflictNode,q$3(e))})}whereRef(e,i,n){return new Ce({...this.#e,onConflictNode:D$3.cloneWithUpdateWhere(this.#e.onConflictNode,G$2(e,i,n))})}clearWhere(){return new Ce({...this.#e,onConflictNode:D$3.cloneWithoutUpdateWhere(this.#e.onConflictNode)})}$call(e){return e(this)}toOperationNode(){return this.#e.onConflictNode}}u(Ce,"don't await OnConflictUpdateBuilder instances.");const dn=r({is(t){return t.kind==="TopNode"},create(t,e){return r({kind:"TopNode",expression:t,modifiers:e})}});function Fe(t,e){if(!Ct$1(t)&&!Bt$1(t))throw new Error(`Invalid top expression: ${t}`);if(!oe$1(e)&&!cn(e))throw new Error(`Invalid top modifiers: ${e}`);return dn.create(t,e)}function cn(t){return t==="percent"||t==="with ties"||t==="percent with ties"}let g$3 = class g{#e;constructor(e){this.#e=r(e);}values(e){const[i,n]=$i(e);return new g({...this.#e,queryNode:P$1.cloneWith(this.#e.queryNode,{columns:i,values:n})})}columns(e){return new g({...this.#e,queryNode:P$1.cloneWith(this.#e.queryNode,{columns:r(e.map(O$1.create))})})}expression(e){return new g({...this.#e,queryNode:P$1.cloneWith(this.#e.queryNode,{values:we(e)})})}defaultValues(){return new g({...this.#e,queryNode:P$1.cloneWith(this.#e.queryNode,{defaultValues:!0})})}ignore(){return new g({...this.#e,queryNode:P$1.cloneWith(this.#e.queryNode,{ignore:!0})})}top(e,i){return new g({...this.#e,queryNode:a.cloneWithTop(this.#e.queryNode,Fe(e,i))})}onConflict(e){return new g({...this.#e,queryNode:P$1.cloneWith(this.#e.queryNode,{onConflict:e(new B$2({onConflictNode:D$3.create()})).toOperationNode()})})}onDuplicateKeyUpdate(e){return new g({...this.#e,queryNode:P$1.cloneWith(this.#e.queryNode,{onDuplicateKey:hn.create(Xt$1(e))})})}returning(e){return new g({...this.#e,queryNode:a.cloneWithReturning(this.#e.queryNode,Q$2(e))})}returningAll(){return new g({...this.#e,queryNode:a.cloneWithReturning(this.#e.queryNode,z$2())})}output(e){return new g({...this.#e,queryNode:a.cloneWithOutput(this.#e.queryNode,Q$2(e))})}outputAll(e){return new g({...this.#e,queryNode:a.cloneWithOutput(this.#e.queryNode,z$2(e))})}clearReturning(){return new g({...this.#e,queryNode:a.cloneWithoutReturning(this.#e.queryNode)})}$call(e){return e(this)}$if(e,i){return e?i(this):new g({...this.#e})}$castTo(){return new g(this.#e)}$narrowType(){return new g(this.#e)}$assertType(){return new g(this.#e)}withPlugin(e){return new g({...this.#e,executor:this.#e.executor.withPlugin(e)})}toOperationNode(){return this.#e.executor.transformQuery(this.#e.queryNode,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){const e=this.compile(),i=await this.#e.executor.executeQuery(e,this.#e.queryId),{adapter:n}=this.#e.executor,s=e.query;return s.returning&&n.supportsReturning||s.output&&n.supportsOutput?i.rows:[new un(i.insertId,i.numAffectedRows??i.numUpdatedOrDeletedRows)]}async executeTakeFirst(){const[e]=await this.execute();return e}async executeTakeFirstOrThrow(e=rt$1){const i=await this.executeTakeFirst();if(i===void 0)throw nt$1(e)?new e(this.toOperationNode()):e(this.toOperationNode());return i}async*stream(e=100){const i=this.compile(),n=this.#e.executor.stream(i,e,this.#e.queryId);for await(const s of n)yield*s.rows;}async explain(e,i){return await new g({...this.#e,queryNode:a.cloneWithExplain(this.#e.queryNode,e,i)}).execute()}};u(g$3,"don't await InsertQueryBuilder instances directly. To execute the query you need to call `execute` or `executeTakeFirst`.");class ln{numDeletedRows;constructor(e){this.numDeletedRows=e;}}const Zt$1=r({is(t){return t.kind==="LimitNode"},create(t){return r({kind:"LimitNode",limit:t})}});let p$2 = class p{#e;constructor(e){this.#e=r(e);}where(...e){return new p({...this.#e,queryNode:a.cloneWithWhere(this.#e.queryNode,q$3(e))})}whereRef(e,i,n){return new p({...this.#e,queryNode:a.cloneWithWhere(this.#e.queryNode,G$2(e,i,n))})}clearWhere(){return new p({...this.#e,queryNode:a.cloneWithoutWhere(this.#e.queryNode)})}top(e,i){return new p({...this.#e,queryNode:a.cloneWithTop(this.#e.queryNode,Fe(e,i))})}using(e){return new p({...this.#e,queryNode:fe.cloneWithUsing(this.#e.queryNode,Xe$1(e))})}innerJoin(...e){return new p({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("InnerJoin",e))})}leftJoin(...e){return new p({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("LeftJoin",e))})}rightJoin(...e){return new p({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("RightJoin",e))})}fullJoin(...e){return new p({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("FullJoin",e))})}returning(e){return new p({...this.#e,queryNode:a.cloneWithReturning(this.#e.queryNode,Q$2(e))})}returningAll(e){return new p({...this.#e,queryNode:a.cloneWithReturning(this.#e.queryNode,z$2(e))})}output(e){return new p({...this.#e,queryNode:a.cloneWithOutput(this.#e.queryNode,Q$2(e))})}outputAll(e){return new p({...this.#e,queryNode:a.cloneWithOutput(this.#e.queryNode,z$2(e))})}clearReturning(){return new p({...this.#e,queryNode:a.cloneWithoutReturning(this.#e.queryNode)})}clearLimit(){return new p({...this.#e,queryNode:fe.cloneWithoutLimit(this.#e.queryNode)})}clearOrderBy(){return new p({...this.#e,queryNode:fe.cloneWithoutOrderBy(this.#e.queryNode)})}orderBy(e,i){return new p({...this.#e,queryNode:fe.cloneWithOrderByItems(this.#e.queryNode,Tt$1([e,i]))})}limit(e){return new p({...this.#e,queryNode:fe.cloneWithLimit(this.#e.queryNode,Zt$1.create(W$3(e)))})}$call(e){return e(this)}$if(e,i){return e?i(this):new p({...this.#e})}$castTo(){return new p(this.#e)}$narrowType(){return new p(this.#e)}$assertType(){return new p(this.#e)}withPlugin(e){return new p({...this.#e,executor:this.#e.executor.withPlugin(e)})}toOperationNode(){return this.#e.executor.transformQuery(this.#e.queryNode,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){const e=this.compile(),i=await this.#e.executor.executeQuery(e,this.#e.queryId),{adapter:n}=this.#e.executor,s=e.query;return s.returning&&n.supportsReturning||s.output&&n.supportsOutput?i.rows:[new ln(i.numAffectedRows??i.numUpdatedOrDeletedRows??BigInt(0))]}async executeTakeFirst(){const[e]=await this.execute();return e}async executeTakeFirstOrThrow(e=rt$1){const i=await this.executeTakeFirst();if(i===void 0)throw nt$1(e)?new e(this.toOperationNode()):e(this.toOperationNode());return i}async*stream(e=100){const i=this.compile(),n=this.#e.executor.stream(i,e,this.#e.queryId);for await(const s of n)yield*s.rows;}async explain(e,i){return await new p({...this.#e,queryNode:a.cloneWithExplain(this.#e.queryNode,e,i)}).execute()}};u(p$2,"don't await DeleteQueryBuilder instances directly. To execute the query you need to call `execute` or `executeTakeFirst`.");class pn{numUpdatedRows;numChangedRows;constructor(e,i){this.numUpdatedRows=e,this.numChangedRows=i;}}let m$1 = class m{#e;constructor(e){this.#e=r(e);}where(...e){return new m({...this.#e,queryNode:a.cloneWithWhere(this.#e.queryNode,q$3(e))})}whereRef(e,i,n){return new m({...this.#e,queryNode:a.cloneWithWhere(this.#e.queryNode,G$2(e,i,n))})}clearWhere(){return new m({...this.#e,queryNode:a.cloneWithoutWhere(this.#e.queryNode)})}top(e,i){return new m({...this.#e,queryNode:a.cloneWithTop(this.#e.queryNode,Fe(e,i))})}from(e){return new m({...this.#e,queryNode:qe.cloneWithFromItems(this.#e.queryNode,Xe$1(e))})}innerJoin(...e){return new m({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("InnerJoin",e))})}leftJoin(...e){return new m({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("LeftJoin",e))})}rightJoin(...e){return new m({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("RightJoin",e))})}fullJoin(...e){return new m({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("FullJoin",e))})}limit(e){return new m({...this.#e,queryNode:qe.cloneWithLimit(this.#e.queryNode,Zt$1.create(W$3(e)))})}set(...e){return new m({...this.#e,queryNode:qe.cloneWithUpdates(this.#e.queryNode,an(...e))})}returning(e){return new m({...this.#e,queryNode:a.cloneWithReturning(this.#e.queryNode,Q$2(e))})}returningAll(e){return new m({...this.#e,queryNode:a.cloneWithReturning(this.#e.queryNode,z$2(e))})}output(e){return new m({...this.#e,queryNode:a.cloneWithOutput(this.#e.queryNode,Q$2(e))})}outputAll(e){return new m({...this.#e,queryNode:a.cloneWithOutput(this.#e.queryNode,z$2(e))})}clearReturning(){return new m({...this.#e,queryNode:a.cloneWithoutReturning(this.#e.queryNode)})}$call(e){return e(this)}$if(e,i){return e?i(this):new m({...this.#e})}$castTo(){return new m(this.#e)}$narrowType(){return new m(this.#e)}$assertType(){return new m(this.#e)}withPlugin(e){return new m({...this.#e,executor:this.#e.executor.withPlugin(e)})}toOperationNode(){return this.#e.executor.transformQuery(this.#e.queryNode,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){const e=this.compile(),i=await this.#e.executor.executeQuery(e,this.#e.queryId),{adapter:n}=this.#e.executor,s=e.query;return s.returning&&n.supportsReturning||s.output&&n.supportsOutput?i.rows:[new pn(i.numAffectedRows??i.numUpdatedOrDeletedRows??BigInt(0),i.numChangedRows)]}async executeTakeFirst(){const[e]=await this.execute();return e}async executeTakeFirstOrThrow(e=rt$1){const i=await this.executeTakeFirst();if(i===void 0)throw nt$1(e)?new e(this.toOperationNode()):e(this.toOperationNode());return i}async*stream(e=100){const i=this.compile(),n=this.#e.executor.stream(i,e,this.#e.queryId);for await(const s of n)yield*s.rows;}async explain(e,i){return await new m({...this.#e,queryNode:a.cloneWithExplain(this.#e.queryNode,e,i)}).execute()}};u(m$1,"don't await UpdateQueryBuilder instances directly. To execute the query you need to call `execute` or `executeTakeFirst`.");const wi=r({is(t){return t.kind==="CommonTableExpressionNameNode"},create(t,e){return r({kind:"CommonTableExpressionNameNode",table:he.create(t),columns:e?r(e.map(O$1.create)):void 0})}}),vt$1=r({is(t){return t.kind==="CommonTableExpressionNode"},create(t,e){return r({kind:"CommonTableExpressionNode",name:t,expression:e})},cloneWith(t,e){return r({...t,...e})}});let Ye$1 = class Ye{#e;constructor(e){this.#e=r(e);}materialized(){return new Ye({...this.#e,node:vt$1.cloneWith(this.#e.node,{materialized:!0})})}notMaterialized(){return new Ye({...this.#e,node:vt$1.cloneWith(this.#e.node,{materialized:!1})})}toOperationNode(){return this.#e.node}};u(Ye$1,"don't await CTEBuilder instances. They are never executed directly and are always just a part of a query.");function gi(t,e){const i=e(qn()).toOperationNode();return A$1(t)?t(fn(i)).toOperationNode():vt$1.create(ji(t),i)}function fn(t){return e=>new Ye$1({node:vt$1.create(ji(e),t)})}function ji(t){if(t.includes("(")){const e=t.split(/[\(\)]/),i=e[0],n=e[1].split(",").map(s=>s.trim());return wi.create(i,n)}else return wi.create(t)}const ut$1=r({is(t){return t.kind==="WithNode"},create(t,e){return r({kind:"WithNode",expressions:r([t]),...e})},cloneWithExpression(t,e){return r({...t,expressions:r([...t.expressions,e])})}}),xi=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"];function mn(t){let e="";for(let i=0;i<t;++i)e+=Nn();return e}function Nn(){return xi[~~(Math.random()*xi.length)]}function l(){return new yn}class yn{#e;get queryId(){return this.#e===void 0&&(this.#e=mn(8)),this.#e}}class Ki{nodeStack=[];#e=r({AliasNode:this.transformAlias.bind(this),ColumnNode:this.transformColumn.bind(this),IdentifierNode:this.transformIdentifier.bind(this),SchemableIdentifierNode:this.transformSchemableIdentifier.bind(this),RawNode:this.transformRaw.bind(this),ReferenceNode:this.transformReference.bind(this),SelectQueryNode:this.transformSelectQuery.bind(this),SelectionNode:this.transformSelection.bind(this),TableNode:this.transformTable.bind(this),FromNode:this.transformFrom.bind(this),SelectAllNode:this.transformSelectAll.bind(this),AndNode:this.transformAnd.bind(this),OrNode:this.transformOr.bind(this),ValueNode:this.transformValue.bind(this),ValueListNode:this.transformValueList.bind(this),PrimitiveValueListNode:this.transformPrimitiveValueList.bind(this),ParensNode:this.transformParens.bind(this),JoinNode:this.transformJoin.bind(this),OperatorNode:this.transformOperator.bind(this),WhereNode:this.transformWhere.bind(this),InsertQueryNode:this.transformInsertQuery.bind(this),DeleteQueryNode:this.transformDeleteQuery.bind(this),ReturningNode:this.transformReturning.bind(this),CreateTableNode:this.transformCreateTable.bind(this),AddColumnNode:this.transformAddColumn.bind(this),ColumnDefinitionNode:this.transformColumnDefinition.bind(this),DropTableNode:this.transformDropTable.bind(this),DataTypeNode:this.transformDataType.bind(this),OrderByNode:this.transformOrderBy.bind(this),OrderByItemNode:this.transformOrderByItem.bind(this),GroupByNode:this.transformGroupBy.bind(this),GroupByItemNode:this.transformGroupByItem.bind(this),UpdateQueryNode:this.transformUpdateQuery.bind(this),ColumnUpdateNode:this.transformColumnUpdate.bind(this),LimitNode:this.transformLimit.bind(this),OffsetNode:this.transformOffset.bind(this),OnConflictNode:this.transformOnConflict.bind(this),OnDuplicateKeyNode:this.transformOnDuplicateKey.bind(this),CreateIndexNode:this.transformCreateIndex.bind(this),DropIndexNode:this.transformDropIndex.bind(this),ListNode:this.transformList.bind(this),PrimaryKeyConstraintNode:this.transformPrimaryKeyConstraint.bind(this),UniqueConstraintNode:this.transformUniqueConstraint.bind(this),ReferencesNode:this.transformReferences.bind(this),CheckConstraintNode:this.transformCheckConstraint.bind(this),WithNode:this.transformWith.bind(this),CommonTableExpressionNode:this.transformCommonTableExpression.bind(this),CommonTableExpressionNameNode:this.transformCommonTableExpressionName.bind(this),HavingNode:this.transformHaving.bind(this),CreateSchemaNode:this.transformCreateSchema.bind(this),DropSchemaNode:this.transformDropSchema.bind(this),AlterTableNode:this.transformAlterTable.bind(this),DropColumnNode:this.transformDropColumn.bind(this),RenameColumnNode:this.transformRenameColumn.bind(this),AlterColumnNode:this.transformAlterColumn.bind(this),ModifyColumnNode:this.transformModifyColumn.bind(this),AddConstraintNode:this.transformAddConstraint.bind(this),DropConstraintNode:this.transformDropConstraint.bind(this),ForeignKeyConstraintNode:this.transformForeignKeyConstraint.bind(this),CreateViewNode:this.transformCreateView.bind(this),DropViewNode:this.transformDropView.bind(this),GeneratedNode:this.transformGenerated.bind(this),DefaultValueNode:this.transformDefaultValue.bind(this),OnNode:this.transformOn.bind(this),ValuesNode:this.transformValues.bind(this),SelectModifierNode:this.transformSelectModifier.bind(this),CreateTypeNode:this.transformCreateType.bind(this),DropTypeNode:this.transformDropType.bind(this),ExplainNode:this.transformExplain.bind(this),DefaultInsertValueNode:this.transformDefaultInsertValue.bind(this),AggregateFunctionNode:this.transformAggregateFunction.bind(this),OverNode:this.transformOver.bind(this),PartitionByNode:this.transformPartitionBy.bind(this),PartitionByItemNode:this.transformPartitionByItem.bind(this),SetOperationNode:this.transformSetOperation.bind(this),BinaryOperationNode:this.transformBinaryOperation.bind(this),UnaryOperationNode:this.transformUnaryOperation.bind(this),UsingNode:this.transformUsing.bind(this),FunctionNode:this.transformFunction.bind(this),CaseNode:this.transformCase.bind(this),WhenNode:this.transformWhen.bind(this),JSONReferenceNode:this.transformJSONReference.bind(this),JSONPathNode:this.transformJSONPath.bind(this),JSONPathLegNode:this.transformJSONPathLeg.bind(this),JSONOperatorChainNode:this.transformJSONOperatorChain.bind(this),TupleNode:this.transformTuple.bind(this),MergeQueryNode:this.transformMergeQuery.bind(this),MatchedNode:this.transformMatched.bind(this),AddIndexNode:this.transformAddIndex.bind(this),CastNode:this.transformCast.bind(this),FetchNode:this.transformFetch.bind(this),TopNode:this.transformTop.bind(this),OutputNode:this.transformOutput.bind(this)});transformNode(e){if(!e)return e;this.nodeStack.push(e);const i=this.transformNodeImpl(e);return this.nodeStack.pop(),r(i)}transformNodeImpl(e){return this.#e[e.kind](e)}transformNodeList(e){return e&&r(e.map(i=>this.transformNode(i)))}transformSelectQuery(e){return {kind:"SelectQueryNode",from:this.transformNode(e.from),selections:this.transformNodeList(e.selections),distinctOn:this.transformNodeList(e.distinctOn),joins:this.transformNodeList(e.joins),groupBy:this.transformNode(e.groupBy),orderBy:this.transformNode(e.orderBy),where:this.transformNode(e.where),frontModifiers:this.transformNodeList(e.frontModifiers),endModifiers:this.transformNodeList(e.endModifiers),limit:this.transformNode(e.limit),offset:this.transformNode(e.offset),with:this.transformNode(e.with),having:this.transformNode(e.having),explain:this.transformNode(e.explain),setOperations:this.transformNodeList(e.setOperations),fetch:this.transformNode(e.fetch),top:this.transformNode(e.top)}}transformSelection(e){return {kind:"SelectionNode",selection:this.transformNode(e.selection)}}transformColumn(e){return {kind:"ColumnNode",column:this.transformNode(e.column)}}transformAlias(e){return {kind:"AliasNode",node:this.transformNode(e.node),alias:this.transformNode(e.alias)}}transformTable(e){return {kind:"TableNode",table:this.transformNode(e.table)}}transformFrom(e){return {kind:"FromNode",froms:this.transformNodeList(e.froms)}}transformReference(e){return {kind:"ReferenceNode",column:this.transformNode(e.column),table:this.transformNode(e.table)}}transformAnd(e){return {kind:"AndNode",left:this.transformNode(e.left),right:this.transformNode(e.right)}}transformOr(e){return {kind:"OrNode",left:this.transformNode(e.left),right:this.transformNode(e.right)}}transformValueList(e){return {kind:"ValueListNode",values:this.transformNodeList(e.values)}}transformParens(e){return {kind:"ParensNode",node:this.transformNode(e.node)}}transformJoin(e){return {kind:"JoinNode",joinType:e.joinType,table:this.transformNode(e.table),on:this.transformNode(e.on)}}transformRaw(e){return {kind:"RawNode",sqlFragments:r([...e.sqlFragments]),parameters:this.transformNodeList(e.parameters)}}transformWhere(e){return {kind:"WhereNode",where:this.transformNode(e.where)}}transformInsertQuery(e){return {kind:"InsertQueryNode",into:this.transformNode(e.into),columns:this.transformNodeList(e.columns),values:this.transformNode(e.values),returning:this.transformNode(e.returning),onConflict:this.transformNode(e.onConflict),onDuplicateKey:this.transformNode(e.onDuplicateKey),with:this.transformNode(e.with),ignore:e.ignore,replace:e.replace,explain:this.transformNode(e.explain),defaultValues:e.defaultValues,top:this.transformNode(e.top),output:this.transformNode(e.output)}}transformValues(e){return {kind:"ValuesNode",values:this.transformNodeList(e.values)}}transformDeleteQuery(e){return {kind:"DeleteQueryNode",from:this.transformNode(e.from),using:this.transformNode(e.using),joins:this.transformNodeList(e.joins),where:this.transformNode(e.where),returning:this.transformNode(e.returning),with:this.transformNode(e.with),orderBy:this.transformNode(e.orderBy),limit:this.transformNode(e.limit),explain:this.transformNode(e.explain),top:this.transformNode(e.top),output:this.transformNode(e.output)}}transformReturning(e){return {kind:"ReturningNode",selections:this.transformNodeList(e.selections)}}transformCreateTable(e){return {kind:"CreateTableNode",table:this.transformNode(e.table),columns:this.transformNodeList(e.columns),constraints:this.transformNodeList(e.constraints),temporary:e.temporary,ifNotExists:e.ifNotExists,onCommit:e.onCommit,frontModifiers:this.transformNodeList(e.frontModifiers),endModifiers:this.transformNodeList(e.endModifiers),selectQuery:this.transformNode(e.selectQuery)}}transformColumnDefinition(e){return {kind:"ColumnDefinitionNode",column:this.transformNode(e.column),dataType:this.transformNode(e.dataType),references:this.transformNode(e.references),primaryKey:e.primaryKey,autoIncrement:e.autoIncrement,unique:e.unique,notNull:e.notNull,unsigned:e.unsigned,defaultTo:this.transformNode(e.defaultTo),check:this.transformNode(e.check),generated:this.transformNode(e.generated),frontModifiers:this.transformNodeList(e.frontModifiers),endModifiers:this.transformNodeList(e.endModifiers),nullsNotDistinct:e.nullsNotDistinct,identity:e.identity,ifNotExists:e.ifNotExists}}transformAddColumn(e){return {kind:"AddColumnNode",column:this.transformNode(e.column)}}transformDropTable(e){return {kind:"DropTableNode",table:this.transformNode(e.table),ifExists:e.ifExists,cascade:e.cascade}}transformOrderBy(e){return {kind:"OrderByNode",items:this.transformNodeList(e.items)}}transformOrderByItem(e){return {kind:"OrderByItemNode",orderBy:this.transformNode(e.orderBy),direction:this.transformNode(e.direction)}}transformGroupBy(e){return {kind:"GroupByNode",items:this.transformNodeList(e.items)}}transformGroupByItem(e){return {kind:"GroupByItemNode",groupBy:this.transformNode(e.groupBy)}}transformUpdateQuery(e){return {kind:"UpdateQueryNode",table:this.transformNode(e.table),from:this.transformNode(e.from),joins:this.transformNodeList(e.joins),where:this.transformNode(e.where),updates:this.transformNodeList(e.updates),returning:this.transformNode(e.returning),with:this.transformNode(e.with),explain:this.transformNode(e.explain),limit:this.transformNode(e.limit),top:this.transformNode(e.top),output:this.transformNode(e.output)}}transformColumnUpdate(e){return {kind:"ColumnUpdateNode",column:this.transformNode(e.column),value:this.transformNode(e.value)}}transformLimit(e){return {kind:"LimitNode",limit:this.transformNode(e.limit)}}transformOffset(e){return {kind:"OffsetNode",offset:this.transformNode(e.offset)}}transformOnConflict(e){return {kind:"OnConflictNode",columns:this.transformNodeList(e.columns),constraint:this.transformNode(e.constraint),indexExpression:this.transformNode(e.indexExpression),indexWhere:this.transformNode(e.indexWhere),updates:this.transformNodeList(e.updates),updateWhere:this.transformNode(e.updateWhere),doNothing:e.doNothing}}transformOnDuplicateKey(e){return {kind:"OnDuplicateKeyNode",updates:this.transformNodeList(e.updates)}}transformCreateIndex(e){return {kind:"CreateIndexNode",name:this.transformNode(e.name),table:this.transformNode(e.table),columns:this.transformNodeList(e.columns),unique:e.unique,using:this.transformNode(e.using),ifNotExists:e.ifNotExists,where:this.transformNode(e.where),nullsNotDistinct:e.nullsNotDistinct}}transformList(e){return {kind:"ListNode",items:this.transformNodeList(e.items)}}transformDropIndex(e){return {kind:"DropIndexNode",name:this.transformNode(e.name),table:this.transformNode(e.table),ifExists:e.ifExists,cascade:e.cascade}}transformPrimaryKeyConstraint(e){return {kind:"PrimaryKeyConstraintNode",columns:this.transformNodeList(e.columns),name:this.transformNode(e.name)}}transformUniqueConstraint(e){return {kind:"UniqueConstraintNode",columns:this.transformNodeList(e.columns),name:this.transformNode(e.name),nullsNotDistinct:e.nullsNotDistinct}}transformForeignKeyConstraint(e){return {kind:"ForeignKeyConstraintNode",columns:this.transformNodeList(e.columns),references:this.transformNode(e.references),name:this.transformNode(e.name),onDelete:e.onDelete,onUpdate:e.onUpdate}}transformSetOperation(e){return {kind:"SetOperationNode",operator:e.operator,expression:this.transformNode(e.expression),all:e.all}}transformReferences(e){return {kind:"ReferencesNode",table:this.transformNode(e.table),columns:this.transformNodeList(e.columns),onDelete:e.onDelete,onUpdate:e.onUpdate}}transformCheckConstraint(e){return {kind:"CheckConstraintNode",expression:this.transformNode(e.expression),name:this.transformNode(e.name)}}transformWith(e){return {kind:"WithNode",expressions:this.transformNodeList(e.expressions),recursive:e.recursive}}transformCommonTableExpression(e){return {kind:"CommonTableExpressionNode",name:this.transformNode(e.name),materialized:e.materialized,expression:this.transformNode(e.expression)}}transformCommonTableExpressionName(e){return {kind:"CommonTableExpressionNameNode",table:this.transformNode(e.table),columns:this.transformNodeList(e.columns)}}transformHaving(e){return {kind:"HavingNode",having:this.transformNode(e.having)}}transformCreateSchema(e){return {kind:"CreateSchemaNode",schema:this.transformNode(e.schema),ifNotExists:e.ifNotExists}}transformDropSchema(e){return {kind:"DropSchemaNode",schema:this.transformNode(e.schema),ifExists:e.ifExists,cascade:e.cascade}}transformAlterTable(e){return {kind:"AlterTableNode",table:this.transformNode(e.table),renameTo:this.transformNode(e.renameTo),setSchema:this.transformNode(e.setSchema),columnAlterations:this.transformNodeList(e.columnAlterations),addConstraint:this.transformNode(e.addConstraint),dropConstraint:this.transformNode(e.dropConstraint),addIndex:this.transformNode(e.addIndex),dropIndex:this.transformNode(e.dropIndex)}}transformDropColumn(e){return {kind:"DropColumnNode",column:this.transformNode(e.column)}}transformRenameColumn(e){return {kind:"RenameColumnNode",column:this.transformNode(e.column),renameTo:this.transformNode(e.renameTo)}}transformAlterColumn(e){return {kind:"AlterColumnNode",column:this.transformNode(e.column),dataType:this.transformNode(e.dataType),dataTypeExpression:this.transformNode(e.dataTypeExpression),setDefault:this.transformNode(e.setDefault),dropDefault:e.dropDefault,setNotNull:e.setNotNull,dropNotNull:e.dropNotNull}}transformModifyColumn(e){return {kind:"ModifyColumnNode",column:this.transformNode(e.column)}}transformAddConstraint(e){return {kind:"AddConstraintNode",constraint:this.transformNode(e.constraint)}}transformDropConstraint(e){return {kind:"DropConstraintNode",constraintName:this.transformNode(e.constraintName),ifExists:e.ifExists,modifier:e.modifier}}transformCreateView(e){return {kind:"CreateViewNode",name:this.transformNode(e.name),temporary:e.temporary,orReplace:e.orReplace,ifNotExists:e.ifNotExists,materialized:e.materialized,columns:this.transformNodeList(e.columns),as:this.transformNode(e.as)}}transformDropView(e){return {kind:"DropViewNode",name:this.transformNode(e.name),ifExists:e.ifExists,materialized:e.materialized,cascade:e.cascade}}transformGenerated(e){return {kind:"GeneratedNode",byDefault:e.byDefault,always:e.always,identity:e.identity,stored:e.stored,expression:this.transformNode(e.expression)}}transformDefaultValue(e){return {kind:"DefaultValueNode",defaultValue:this.transformNode(e.defaultValue)}}transformOn(e){return {kind:"OnNode",on:this.transformNode(e.on)}}transformSelectModifier(e){return {kind:"SelectModifierNode",modifier:e.modifier,rawModifier:this.transformNode(e.rawModifier),of:this.transformNodeList(e.of)}}transformCreateType(e){return {kind:"CreateTypeNode",name:this.transformNode(e.name),enum:this.transformNode(e.enum)}}transformDropType(e){return {kind:"DropTypeNode",name:this.transformNode(e.name),ifExists:e.ifExists}}transformExplain(e){return {kind:"ExplainNode",format:e.format,options:this.transformNode(e.options)}}transformSchemableIdentifier(e){return {kind:"SchemableIdentifierNode",schema:this.transformNode(e.schema),identifier:this.transformNode(e.identifier)}}transformAggregateFunction(e){return {kind:"AggregateFunctionNode",aggregated:this.transformNodeList(e.aggregated),distinct:e.distinct,filter:this.transformNode(e.filter),func:e.func,over:this.transformNode(e.over)}}transformOver(e){return {kind:"OverNode",orderBy:this.transformNode(e.orderBy),partitionBy:this.transformNode(e.partitionBy)}}transformPartitionBy(e){return {kind:"PartitionByNode",items:this.transformNodeList(e.items)}}transformPartitionByItem(e){return {kind:"PartitionByItemNode",partitionBy:this.transformNode(e.partitionBy)}}transformBinaryOperation(e){return {kind:"BinaryOperationNode",leftOperand:this.transformNode(e.leftOperand),operator:this.transformNode(e.operator),rightOperand:this.transformNode(e.rightOperand)}}transformUnaryOperation(e){return {kind:"UnaryOperationNode",operator:this.transformNode(e.operator),operand:this.transformNode(e.operand)}}transformUsing(e){return {kind:"UsingNode",tables:this.transformNodeList(e.tables)}}transformFunction(e){return {kind:"FunctionNode",func:e.func,arguments:this.transformNodeList(e.arguments)}}transformCase(e){return {kind:"CaseNode",value:this.transformNode(e.value),when:this.transformNodeList(e.when),else:this.transformNode(e.else),isStatement:e.isStatement}}transformWhen(e){return {kind:"WhenNode",condition:this.transformNode(e.condition),result:this.transformNode(e.result)}}transformJSONReference(e){return {kind:"JSONReferenceNode",reference:this.transformNode(e.reference),traversal:this.transformNode(e.traversal)}}transformJSONPath(e){return {kind:"JSONPathNode",inOperator:this.transformNode(e.inOperator),pathLegs:this.transformNodeList(e.pathLegs)}}transformJSONPathLeg(e){return {kind:"JSONPathLegNode",type:e.type,value:e.value}}transformJSONOperatorChain(e){return {kind:"JSONOperatorChainNode",operator:this.transformNode(e.operator),values:this.transformNodeList(e.values)}}transformTuple(e){return {kind:"TupleNode",values:this.transformNodeList(e.values)}}transformMergeQuery(e){return {kind:"MergeQueryNode",into:this.transformNode(e.into),using:this.transformNode(e.using),whens:this.transformNodeList(e.whens),with:this.transformNode(e.with),top:this.transformNode(e.top),output:this.transformNode(e.output)}}transformMatched(e){return {kind:"MatchedNode",not:e.not,bySource:e.bySource}}transformAddIndex(e){return {kind:"AddIndexNode",name:this.transformNode(e.name),columns:this.transformNodeList(e.columns),unique:e.unique,using:this.transformNode(e.using),ifNotExists:e.ifNotExists}}transformCast(e){return {kind:"CastNode",expression:this.transformNode(e.expression),dataType:this.transformNode(e.dataType)}}transformFetch(e){return {kind:"FetchNode",rowCount:this.transformNode(e.rowCount),modifier:e.modifier}}transformTop(e){return {kind:"TopNode",expression:e.expression,modifiers:e.modifiers}}transformOutput(e){return {kind:"OutputNode",selections:this.transformNodeList(e.selections)}}transformDataType(e){return e}transformSelectAll(e){return e}transformIdentifier(e){return e}transformValue(e){return e}transformPrimitiveValueList(e){return e}transformOperator(e){return e}transformDefaultInsertValue(e){return e}}const wn=r({AlterTableNode:!0,CreateIndexNode:!0,CreateSchemaNode:!0,CreateTableNode:!0,CreateTypeNode:!0,CreateViewNode:!0,DeleteQueryNode:!0,DropIndexNode:!0,DropSchemaNode:!0,DropTableNode:!0,DropTypeNode:!0,DropViewNode:!0,InsertQueryNode:!0,RawNode:!0,SelectQueryNode:!0,UpdateQueryNode:!0,MergeQueryNode:!0});class gn extends Ki{#e;#t=new Set;#i=new Set;constructor(e){super(),this.#e=e;}transformNodeImpl(e){if(!this.#r(e))return super.transformNodeImpl(e);const i=this.#o(e);for(const o of i)this.#i.add(o);const n=this.#n(e);for(const o of n)this.#t.add(o);const s=super.transformNodeImpl(e);for(const o of n)this.#t.delete(o);for(const o of i)this.#i.delete(o);return s}transformSchemableIdentifier(e){const i=super.transformSchemableIdentifier(e);return i.schema||!this.#t.has(e.identifier.name)?i:{...i,schema:w$2.create(this.#e)}}transformReferences(e){const i=super.transformReferences(e);return i.table.table.schema?i:{...i,table:he.createWithSchema(this.#e,i.table.table.identifier.name)}}#r(e){return e.kind in wn}#n(e){const i=new Set;if("name"in e&&e.name&&ue.is(e.name)&&this.#a(e.name,i),"from"in e&&e.from)for(const n of e.from.froms)this.#s(n,i);if("into"in e&&e.into&&this.#s(e.into,i),"table"in e&&e.table&&this.#s(e.table,i),"joins"in e&&e.joins)for(const n of e.joins)this.#s(n.table,i);return "using"in e&&e.using&&this.#s(e.using,i),i}#o(e){const i=new Set;return "with"in e&&e.with&&this.#h(e.with,i),i}#s(e,i){const n=he.is(e)?e:le.is(e)&&he.is(e.node)?e.node:null;n&&this.#a(n.table,i);}#a(e,i){const n=e.identifier.name;!this.#t.has(n)&&!this.#i.has(n)&&i.add(n);}#h(e,i){for(const n of e.expressions){const s=n.name.table.table.identifier.name;this.#i.has(s)||i.add(s);}}}let st$1 = class st{#e;constructor(e){this.#e=new gn(e);}transformQuery(e){return this.#e.transformNode(e.node)}async transformResult(e){return e.result}};const xn=r({is(t){return t.kind==="MatchedNode"},create(t,e=!1){return r({kind:"MatchedNode",not:t,bySource:e})}});function vi(t,e,i){return it$1.create(gt$1([xn.create(!t.isMatched,t.bySource),...e&&e.length>0?[e.length===3&&i?G$2(e[0],e[1],e[2]):q$3(e)]:[]],"and",!1))}function je(t){return E$2(t)?b$2.create([t],[]):L$2(t)?t.toOperationNode():t}class Oi{#e;#t;#i;constructor(){this.#e=new Promise((e,i)=>{this.#i=i,this.#t=e;});}get promise(){return this.#e}resolve=e=>{this.#t&&this.#t(e);};reject=e=>{this.#i&&this.#i(e);}}const Wi=new Set;function vn(t){Wi.has(t)||(Wi.add(t),console.log(t));}const On=r([]);class Gi{#e;constructor(e=On){this.#e=e;}get plugins(){return this.#e}transformQuery(e,i){for(const n of this.#e){const s=n.transformQuery({node:e,queryId:i});if(s.kind===e.kind)e=s;else throw new Error(["KyselyPlugin.transformQuery must return a node","of the same kind that was given to it.",`The plugin was given a ${e.kind}`,`but it returned a ${s.kind}`].join(" "))}return e}async executeQuery(e,i){return await this.provideConnection(async n=>{const s=await n.executeQuery(e),o=await this.#t(s,i);return Wn(s,o),o})}async*stream(e,i,n){const s=new Oi,o=new Oi;this.provideConnection(async C=>(s.resolve(C),await o.promise)).catch(C=>s.reject(C));const x=await s.promise;try{for await(const C of x.streamQuery(e,i))yield await this.#t(C,n);}finally{o.resolve();}}async#t(e,i){for(const n of this.#e)e=await n.transformResult({result:e,queryId:i});return e}}function Wn(t,e){const{numAffectedRows:i}=t;i===void 0&&t.numUpdatedOrDeletedRows===void 0||i!==void 0&&e.numAffectedRows!==void 0||vn("kysely:warning: outdated driver/plugin detected! QueryResult.numUpdatedOrDeletedRows is deprecated and will be removed in a future release.");}let Oe$1 = class Oe extends Gi{get adapter(){throw new Error("this query cannot be compiled to SQL")}compileQuery(){throw new Error("this query cannot be compiled to SQL")}provideConnection(){throw new Error("this query cannot be executed")}withConnectionProvider(){throw new Error("this query cannot have a connection provider")}withPlugin(e){return new Oe([...this.plugins,e])}withPlugins(e){return new Oe([...this.plugins,...e])}withPluginAtFront(e){return new Oe([e,...this.plugins])}withoutPlugins(){return new Oe([])}};const It$1=new Oe$1;class bn{numChangedRows;constructor(e){this.numChangedRows=e;}}class ke{#e;constructor(e){this.#e=r(e);}top(e,i){return new ke({...this.#e,queryNode:a.cloneWithTop(this.#e.queryNode,Fe(e,i))})}using(...e){return new V$1({...this.#e,queryNode:S$2.cloneWithUsing(this.#e.queryNode,k$2("Using",e))})}output(e){return new ke({...this.#e,queryNode:a.cloneWithOutput(this.#e.queryNode,Q$2(e))})}outputAll(e){return new ke({...this.#e,queryNode:a.cloneWithOutput(this.#e.queryNode,z$2(e))})}}u(ke,"don't await MergeQueryBuilder instances directly. To execute the query you need to call `execute` when available.");let V$1 = class V{#e;constructor(e){this.#e=r(e);}top(e,i){return new V({...this.#e,queryNode:a.cloneWithTop(this.#e.queryNode,Fe(e,i))})}whenMatched(){return this.#t([])}whenMatchedAnd(...e){return this.#t(e)}whenMatchedAndRef(e,i,n){return this.#t([e,i,n],!0)}#t(e,i){return new Ut$1({...this.#e,queryNode:S$2.cloneWithWhen(this.#e.queryNode,vi({isMatched:!0},e,i))})}whenNotMatched(){return this.#i([])}whenNotMatchedAnd(...e){return this.#i(e)}whenNotMatchedAndRef(e,i,n){return this.#i([e,i,n],!0)}whenNotMatchedBySource(){return this.#i([],!1,!0)}whenNotMatchedBySourceAnd(...e){return this.#i(e,!1,!0)}whenNotMatchedBySourceAndRef(e,i,n){return this.#i([e,i,n],!0,!0)}output(e){return new V({...this.#e,queryNode:a.cloneWithOutput(this.#e.queryNode,Q$2(e))})}outputAll(e){return new V({...this.#e,queryNode:a.cloneWithOutput(this.#e.queryNode,z$2(e))})}#i(e,i=!1,n=!1){const s={...this.#e,queryNode:S$2.cloneWithWhen(this.#e.queryNode,vi({isMatched:!1,bySource:n},e,i))},o=n?Ut$1:zi;return new o(s)}$call(e){return e(this)}$if(e,i){return e?i(this):new V({...this.#e})}toOperationNode(){return this.#e.executor.transformQuery(this.#e.queryNode,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){const e=this.compile(),i=await this.#e.executor.executeQuery(e,this.#e.queryId);return e.query.output&&this.#e.executor.adapter.supportsOutput?i.rows:[new bn(i.numAffectedRows)]}async executeTakeFirst(){const[e]=await this.execute();return e}async executeTakeFirstOrThrow(e=rt$1){const i=await this.executeTakeFirst();if(i===void 0)throw nt$1(e)?new e(this.toOperationNode()):e(this.toOperationNode());return i}};u(V$1,"don't await WheneableMergeQueryBuilder instances directly. To execute the query you need to call `execute`.");let Ut$1 = class Ut{#e;constructor(e){this.#e=r(e);}thenDelete(){return new V$1({...this.#e,queryNode:S$2.cloneWithThen(this.#e.queryNode,je("delete"))})}thenDoNothing(){return new V$1({...this.#e,queryNode:S$2.cloneWithThen(this.#e.queryNode,je("do nothing"))})}thenUpdate(e){return new V$1({...this.#e,queryNode:S$2.cloneWithThen(this.#e.queryNode,je(e(new m$1({queryId:this.#e.queryId,executor:It$1,queryNode:qe.createWithoutTable()}))))})}thenUpdateSet(...e){return this.thenUpdate(i=>i.set(...e))}};u(Ut$1,"don't await MatchedThenableMergeQueryBuilder instances directly. To execute the query you need to call `execute` when available.");class zi{#e;constructor(e){this.#e=r(e);}thenDoNothing(){return new V$1({...this.#e,queryNode:S$2.cloneWithThen(this.#e.queryNode,je("do nothing"))})}thenInsertValues(e){const[i,n]=$i(e);return new V$1({...this.#e,queryNode:S$2.cloneWithThen(this.#e.queryNode,je(P$1.cloneWith(P$1.createWithoutInto(),{columns:i,values:n})))})}}u(zi,"don't await NotMatchedThenableMergeQueryBuilder instances directly. To execute the query you need to call `execute` when available.");let re$1 = class re{#e;constructor(e){this.#e=r(e);}selectFrom(e){return $t$1({queryId:l(),executor:this.#e.executor,queryNode:d$1.createFrom(Xe$1(e),this.#e.withNode)})}selectNoFrom(e){return $t$1({queryId:l(),executor:this.#e.executor,queryNode:d$1.cloneWithSelections(d$1.create(this.#e.withNode),Q$2(e))})}insertInto(e){return new g$3({queryId:l(),executor:this.#e.executor,queryNode:P$1.create(v$2(e),this.#e.withNode)})}replaceInto(e){return new g$3({queryId:l(),executor:this.#e.executor,queryNode:P$1.create(v$2(e),this.#e.withNode,!0)})}deleteFrom(e){return new p$2({queryId:l(),executor:this.#e.executor,queryNode:fe.create(Xe$1(e),this.#e.withNode)})}updateTable(e){return new m$1({queryId:l(),executor:this.#e.executor,queryNode:qe.create(Ze$1(e),this.#e.withNode)})}mergeInto(e){return new ke({queryId:l(),executor:this.#e.executor,queryNode:S$2.create(tr$1(e),this.#e.withNode)})}with(e,i){const n=gi(e,i);return new re({...this.#e,withNode:this.#e.withNode?ut$1.cloneWithExpression(this.#e.withNode,n):ut$1.create(n)})}withRecursive(e,i){const n=gi(e,i);return new re({...this.#e,withNode:this.#e.withNode?ut$1.cloneWithExpression(this.#e.withNode,n):ut$1.create(n,{recursive:!0})})}withPlugin(e){return new re({...this.#e,executor:this.#e.executor.withPlugin(e)})}withoutPlugins(){return new re({...this.#e,executor:this.#e.executor.withoutPlugins()})}withSchema(e){return new re({...this.#e,executor:this.#e.executor.withPluginAtFront(new st$1(e))})}};function qn(){return new re$1({executor:It$1})}function Cn(t,e){return new be({joinNode:$e.create(t,Ze$1(e))})}function kn(){return new He({overNode:Vt$1.create()})}function k$2(t,e){if(e.length===3)return In(t,e[0],e[1],e[2]);if(e.length===2)return Tn(t,e[0],e[1]);throw new Error("not implemented")}function Tn(t,e,i){return i(Cn(t,e)).toOperationNode()}function In(t,e,i,n){return $e.createWithOn(t,Ze$1(e),G$2(i,"=",n))}const Sn=r({is(t){return t.kind==="OffsetNode"},create(t){return r({kind:"OffsetNode",offset:t})}}),En=r({is(t){return t.kind==="GroupByItemNode"},create(t){return r({kind:"GroupByItemNode",groupBy:t})}});function An(t){return t=A$1(t)?t(Je$1()):t,ze$1(t).map(En.create)}const Hi=r({is(t){return t.kind==="SetOperationNode"},create(t,e,i){return r({kind:"SetOperationNode",operator:t,expression:e,all:i})}});function ge(t,e,i){return A$1(e)&&(e=e(ei())),_(e)||(e=[e]),e.map(n=>Hi.create(t,we(n),i))}class f{#e;constructor(e){this.#e=e;}get expressionType(){}as(e){return new _t$1(this,e)}or(...e){return new Ot$1(Me.create(this.#e,q$3(e)))}and(...e){return new Wt$1(de.create(this.#e,q$3(e)))}$castTo(){return new f(this.#e)}$notNull(){return new f(this.#e)}toOperationNode(){return this.#e}}let _t$1 = class _t{#e;#t;constructor(e,i){this.#e=e,this.#t=i;}get expression(){return this.#e}get alias(){return this.#t}toOperationNode(){return le.create(this.#e.toOperationNode(),L$2(this.#t)?this.#t.toOperationNode():w$2.create(this.#t))}};let Ot$1 = class Ot{#e;constructor(e){this.#e=e;}get expressionType(){}as(e){return new _t$1(this,e)}or(...e){return new Ot(Me.create(this.#e,q$3(e)))}$castTo(){return new Ot(this.#e)}toOperationNode(){return Re.create(this.#e)}};let Wt$1 = class Wt{#e;constructor(e){this.#e=e;}get expressionType(){}as(e){return new _t$1(this,e)}and(...e){return new Wt(de.create(this.#e,q$3(e)))}$castTo(){return new Wt(this.#e)}toOperationNode(){return Re.create(this.#e)}};const Ln={is(t){return t.kind==="FetchNode"},create(t,e){return {kind:"FetchNode",rowCount:K$2.create(t),modifier:e}}};function Rn(t,e){if(!Ct$1(t)&&!Bt$1(t))throw new Error(`Invalid fetch row count: ${t}`);if(!Dn(e))throw new Error(`Invalid fetch modifier: ${e}`);return Ln.create(t,e)}function Dn(t){return t==="only"||t==="with ties"}let h$1 = class h{#e;constructor(e){this.#e=r(e);}get expressionType(){}get isSelectQueryBuilder(){return !0}where(...e){return new h({...this.#e,queryNode:a.cloneWithWhere(this.#e.queryNode,q$3(e))})}whereRef(e,i,n){return new h({...this.#e,queryNode:a.cloneWithWhere(this.#e.queryNode,G$2(e,i,n))})}having(...e){return new h({...this.#e,queryNode:d$1.cloneWithHaving(this.#e.queryNode,q$3(e))})}havingRef(e,i,n){return new h({...this.#e,queryNode:d$1.cloneWithHaving(this.#e.queryNode,G$2(e,i,n))})}select(e){return new h({...this.#e,queryNode:d$1.cloneWithSelections(this.#e.queryNode,Q$2(e))})}distinctOn(e){return new h({...this.#e,queryNode:d$1.cloneWithDistinctOn(this.#e.queryNode,ze$1(e))})}modifyFront(e){return new h({...this.#e,queryNode:d$1.cloneWithFrontModifier(this.#e.queryNode,Y$1.createWithExpression(e.toOperationNode()))})}modifyEnd(e){return new h({...this.#e,queryNode:d$1.cloneWithEndModifier(this.#e.queryNode,Y$1.createWithExpression(e.toOperationNode()))})}distinct(){return new h({...this.#e,queryNode:d$1.cloneWithFrontModifier(this.#e.queryNode,Y$1.create("Distinct"))})}forUpdate(e){return new h({...this.#e,queryNode:d$1.cloneWithEndModifier(this.#e.queryNode,Y$1.create("ForUpdate",e?ht$1(e).map(v$2):void 0))})}forShare(e){return new h({...this.#e,queryNode:d$1.cloneWithEndModifier(this.#e.queryNode,Y$1.create("ForShare",e?ht$1(e).map(v$2):void 0))})}forKeyShare(e){return new h({...this.#e,queryNode:d$1.cloneWithEndModifier(this.#e.queryNode,Y$1.create("ForKeyShare",e?ht$1(e).map(v$2):void 0))})}forNoKeyUpdate(e){return new h({...this.#e,queryNode:d$1.cloneWithEndModifier(this.#e.queryNode,Y$1.create("ForNoKeyUpdate",e?ht$1(e).map(v$2):void 0))})}skipLocked(){return new h({...this.#e,queryNode:d$1.cloneWithEndModifier(this.#e.queryNode,Y$1.create("SkipLocked"))})}noWait(){return new h({...this.#e,queryNode:d$1.cloneWithEndModifier(this.#e.queryNode,Y$1.create("NoWait"))})}selectAll(e){return new h({...this.#e,queryNode:d$1.cloneWithSelections(this.#e.queryNode,z$2(e))})}innerJoin(...e){return new h({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("InnerJoin",e))})}leftJoin(...e){return new h({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("LeftJoin",e))})}rightJoin(...e){return new h({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("RightJoin",e))})}fullJoin(...e){return new h({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("FullJoin",e))})}innerJoinLateral(...e){return new h({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("LateralInnerJoin",e))})}leftJoinLateral(...e){return new h({...this.#e,queryNode:a.cloneWithJoin(this.#e.queryNode,k$2("LateralLeftJoin",e))})}orderBy(...e){return new h({...this.#e,queryNode:d$1.cloneWithOrderByItems(this.#e.queryNode,Tt$1(e))})}groupBy(e){return new h({...this.#e,queryNode:d$1.cloneWithGroupByItems(this.#e.queryNode,An(e))})}limit(e){return new h({...this.#e,queryNode:d$1.cloneWithLimit(this.#e.queryNode,Zt$1.create(W$3(e)))})}offset(e){return new h({...this.#e,queryNode:d$1.cloneWithOffset(this.#e.queryNode,Sn.create(W$3(e)))})}fetch(e,i="only"){return new h({...this.#e,queryNode:d$1.cloneWithFetch(this.#e.queryNode,Rn(e,i))})}top(e,i){return new h({...this.#e,queryNode:a.cloneWithTop(this.#e.queryNode,Fe(e,i))})}union(e){return new h({...this.#e,queryNode:d$1.cloneWithSetOperations(this.#e.queryNode,ge("union",e,!1))})}unionAll(e){return new h({...this.#e,queryNode:d$1.cloneWithSetOperations(this.#e.queryNode,ge("union",e,!0))})}intersect(e){return new h({...this.#e,queryNode:d$1.cloneWithSetOperations(this.#e.queryNode,ge("intersect",e,!1))})}intersectAll(e){return new h({...this.#e,queryNode:d$1.cloneWithSetOperations(this.#e.queryNode,ge("intersect",e,!0))})}except(e){return new h({...this.#e,queryNode:d$1.cloneWithSetOperations(this.#e.queryNode,ge("except",e,!1))})}exceptAll(e){return new h({...this.#e,queryNode:d$1.cloneWithSetOperations(this.#e.queryNode,ge("except",e,!0))})}as(e){return new Yi(this,e)}clearSelect(){return new h({...this.#e,queryNode:d$1.cloneWithoutSelections(this.#e.queryNode)})}clearWhere(){return new h({...this.#e,queryNode:a.cloneWithoutWhere(this.#e.queryNode)})}clearLimit(){return new h({...this.#e,queryNode:d$1.cloneWithoutLimit(this.#e.queryNode)})}clearOffset(){return new h({...this.#e,queryNode:d$1.cloneWithoutOffset(this.#e.queryNode)})}clearOrderBy(){return new h({...this.#e,queryNode:d$1.cloneWithoutOrderBy(this.#e.queryNode)})}clearGroupBy(){return new h({...this.#e,queryNode:d$1.cloneWithoutGroupBy(this.#e.queryNode)})}$call(e){return e(this)}$if(e,i){return e?i(this):new h({...this.#e})}$castTo(){return new h(this.#e)}$narrowType(){return new h(this.#e)}$assertType(){return new h(this.#e)}$asTuple(){return new f(this.toOperationNode())}withPlugin(e){return new h({...this.#e,executor:this.#e.executor.withPlugin(e)})}toOperationNode(){return this.#e.executor.transformQuery(this.#e.queryNode,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){const e=this.compile();return (await this.#e.executor.executeQuery(e,this.#e.queryId)).rows}async executeTakeFirst(){const[e]=await this.execute();return e}async executeTakeFirstOrThrow(e=rt$1){const i=await this.executeTakeFirst();if(i===void 0)throw nt$1(e)?new e(this.toOperationNode()):e(this.toOperationNode());return i}async*stream(e=100){const i=this.compile(),n=this.#e.executor.stream(i,e,this.#e.queryId);for await(const s of n)yield*s.rows;}async explain(e,i){return await new h({...this.#e,queryNode:a.cloneWithExplain(this.#e.queryNode,e,i)}).execute()}};u(h$1,"don't await SelectQueryBuilder instances directly. To execute the query you need to call `execute` or `executeTakeFirst`.");function $t$1(t){return new h$1(t)}class Yi{#e;#t;constructor(e,i){this.#e=e,this.#t=i;}get expression(){return this.#e}get alias(){return this.#t}get isAliasedSelectQueryBuilder(){return !0}toOperationNode(){return le.create(this.#e.toOperationNode(),w$2.create(this.#t))}}u(Yi,"don't await AliasedSelectQueryBuilder instances directly. AliasedSelectQueryBuilder should never be executed directly since it's always a part of another query.");const Ne$1=r({is(t){return t.kind==="AggregateFunctionNode"},create(t,e=[]){return r({kind:"AggregateFunctionNode",func:t,aggregated:e})},cloneWithDistinct(t){return r({...t,distinct:!0})},cloneWithFilter(t,e){return r({...t,filter:t.filter?I$1.cloneWithOperation(t.filter,"And",e):I$1.create(e)})},cloneWithOrFilter(t,e){return r({...t,filter:t.filter?I$1.cloneWithOperation(t.filter,"Or",e):I$1.create(e)})},cloneWithOver(t,e){return r({...t,over:e})}}),bi=r({is(t){return t.kind==="FunctionNode"},create(t,e){return r({kind:"FunctionNode",func:t,arguments:e})}});let U$3 = class U{#e;constructor(e){this.#e=r(e);}get expressionType(){}as(e){return new Pn(this,e)}distinct(){return new U({...this.#e,aggregateFunctionNode:Ne$1.cloneWithDistinct(this.#e.aggregateFunctionNode)})}filterWhere(...e){return new U({...this.#e,aggregateFunctionNode:Ne$1.cloneWithFilter(this.#e.aggregateFunctionNode,q$3(e))})}filterWhereRef(e,i,n){return new U({...this.#e,aggregateFunctionNode:Ne$1.cloneWithFilter(this.#e.aggregateFunctionNode,G$2(e,i,n))})}over(e){const i=kn();return new U({...this.#e,aggregateFunctionNode:Ne$1.cloneWithOver(this.#e.aggregateFunctionNode,(e?e(i):i).toOperationNode())})}$call(e){return e(this)}$castTo(){return new U(this.#e)}$notNull(){return new U(this.#e)}toOperationNode(){return this.#e.aggregateFunctionNode}};u(U$3,"don't await AggregateFunctionBuilder instances. They are never executed directly and are always just a part of a query.");class Pn{#e;#t;constructor(e,i){this.#e=e,this.#t=i;}get expression(){return this.#e}get alias(){return this.#t}toOperationNode(){return le.create(this.#e.toOperationNode(),w$2.create(this.#t))}}function Xi(){const t=(i,n)=>new f(bi.create(i,ze$1(n??[]))),e=(i,n)=>new U$3({aggregateFunctionNode:Ne$1.create(i,n?ze$1(n):void 0)});return Object.assign(t,{agg:e,avg(i){return e("avg",[i])},coalesce(...i){return t("coalesce",i)},count(i){return e("count",[i])},countAll(i){return new U$3({aggregateFunctionNode:Ne$1.create("count",z$2(i))})},max(i){return e("max",[i])},min(i){return e("min",[i])},sum(i){return e("sum",[i])},any(i){return t("any",[i])},jsonAgg(i){return new U$3({aggregateFunctionNode:Ne$1.create("json_agg",[E$2(i)?v$2(i):i.toOperationNode()])})},toJson(i){return new f(bi.create("to_json",[E$2(i)?v$2(i):i.toOperationNode()]))}})}const Mn=r({is(t){return t.kind==="UnaryOperationNode"},create(t,e){return r({kind:"UnaryOperationNode",operator:t,operand:e})}});function Fn(t,e){return Mn.create(ce.create(t),M$3(e))}const j=r({is(t){return t.kind==="CaseNode"},create(t){return r({kind:"CaseNode",value:t})},cloneWithWhen(t,e){return r({...t,when:r(t.when?[...t.when,e]:[e])})},cloneWithThen(t,e){return r({...t,when:t.when?r([...t.when.slice(0,-1),it$1.cloneWithResult(t.when[t.when.length-1],e)]):void 0})},cloneWith(t,e){return r({...t,...e})}});class Zi{#e;constructor(e){this.#e=r(e);}when(...e){return new _i({...this.#e,node:j.cloneWithWhen(this.#e.node,it$1.create(q$3(e)))})}}class _i{#e;constructor(e){this.#e=r(e);}then(e){return new Jn({...this.#e,node:j.cloneWithThen(this.#e.node,zt$1(e)?Ht$1(e):W$3(e))})}}class Jn{#e;constructor(e){this.#e=r(e);}when(...e){return new _i({...this.#e,node:j.cloneWithWhen(this.#e.node,it$1.create(q$3(e)))})}else(e){return new Vn({...this.#e,node:j.cloneWith(this.#e.node,{else:zt$1(e)?Ht$1(e):W$3(e)})})}end(){return new f(j.cloneWith(this.#e.node,{isStatement:!1}))}endCase(){return new f(j.cloneWith(this.#e.node,{isStatement:!0}))}}class Vn{#e;constructor(e){this.#e=r(e);}end(){return new f(j.cloneWith(this.#e.node,{isStatement:!1}))}endCase(){return new f(j.cloneWith(this.#e.node,{isStatement:!0}))}}const qi=r({is(t){return t.kind==="JSONPathLegNode"},create(t,e){return r({kind:"JSONPathLegNode",type:t,value:e})}});let Ke$1 = class Ke{#e;constructor(e){this.#e=e;}at(e){return this.#t("ArrayLocation",e)}key(e){return this.#t("Member",e)}#t(e,i){return yt$1.is(this.#e)?new Ci(yt$1.cloneWithTraversal(this.#e,Qe$1.is(this.#e.traversal)?Qe$1.cloneWithLeg(this.#e.traversal,qi.create(e,i)):Mi.cloneWithValue(this.#e.traversal,K$2.createImmediate(i)))):new Ci(Qe$1.cloneWithLeg(this.#e,qi.create(e,i)))}};class Ci extends Ke$1{#e;constructor(e){super(e),this.#e=e;}get expressionType(){}as(e){return new Un(this,e)}$castTo(){return new Ke$1(this.#e)}$notNull(){return new Ke$1(this.#e)}toOperationNode(){return this.#e}}class Un{#e;#t;constructor(e,i){this.#e=e,this.#t=i;}get expression(){return this.#e}get alias(){return this.#t}toOperationNode(){return le.create(this.#e.toOperationNode(),L$2(this.#t)?this.#t.toOperationNode():w$2.create(this.#t))}}const ki=r({is(t){return t.kind==="TupleNode"},create(t){return r({kind:"TupleNode",values:r(t)})}}),$n=["varchar","char","text","integer","int2","int4","int8","smallint","bigint","boolean","real","double precision","float4","float8","decimal","numeric","binary","bytea","date","datetime","time","timetz","timestamp","timestamptz","serial","bigserial","uuid","json","jsonb","blob","varbinary"],Qn=[/^varchar\(\d+\)$/,/^char\(\d+\)$/,/^decimal\(\d+, \d+\)$/,/^numeric\(\d+, \d+\)$/,/^binary\(\d+\)$/,/^datetime\(\d+\)$/,/^time\(\d+\)$/,/^timetz\(\d+\)$/,/^timestamp\(\d+\)$/,/^timestamptz\(\d+\)$/,/^varbinary\(\d+\)$/],Bn=r({is(t){return t.kind==="DataTypeNode"},create(t){return r({kind:"DataTypeNode",dataType:t})}});function jn(t){return !!($n.includes(t)||Qn.some(e=>e.test(t)))}function ye(t){if(L$2(t))return t.toOperationNode();if(jn(t))return Bn.create(t);throw new Error(`invalid column data type ${JSON.stringify(t)}`)}const Kn=r({is(t){return t.kind==="CastNode"},create(t,e){return r({kind:"CastNode",expression:t,dataType:e})}});function ei(t=It$1){function e(s,o,x){return new f(Yt$1(s,o,x))}function i(s,o){return new f(Fn(s,o))}const n=Object.assign(e,{fn:void 0,eb:void 0,selectFrom(s){return $t$1({queryId:l(),executor:t,queryNode:d$1.createFrom(Xe$1(s))})},case(s){return new Zi({node:j.create(oe$1(s)?void 0:M$3(s))})},ref(s,o){return oe$1(o)?new f(ee$1(s)):new Ke$1(jr(s,o))},jsonPath(){return new Ke$1(Qe$1.create())},table(s){return new f(v$2(s))},val(s){return new f(W$3(s))},refTuple(...s){return new f(ki.create(s.map(M$3)))},tuple(...s){return new f(ki.create(s.map(W$3)))},lit(s){return new f(Ht$1(s))},unary:i,not(s){return i("not",s)},exists(s){return i("exists",s)},neg(s){return i("-",s)},between(s,o,x){return new f(Le.create(M$3(s),ce.create("between"),de.create(W$3(o),W$3(x))))},betweenSymmetric(s,o,x){return new f(Le.create(M$3(s),ce.create("between symmetric"),de.create(W$3(o),W$3(x))))},and(s){return _(s)?new f(gt$1(s,"and")):new f(hi(s,"and"))},or(s){return _(s)?new f(gt$1(s,"or")):new f(hi(s,"or"))},parens(...s){const o=q$3(s);return Re.is(o)?new f(o):new f(Re.create(o))},cast(s,o){return new f(Kn.create(M$3(s),ye(o)))},withSchema(s){return ei(t.withPluginAtFront(new st$1(s)))}});return n.fn=Xi(),n.eb=n,n}function Je$1(t){return ei()}function we(t){if(L$2(t))return t.toOperationNode();if(A$1(t))return t(Je$1()).toOperationNode();throw new Error(`invalid expression: ${JSON.stringify(t)}`)}function er$1(t){if(L$2(t))return t.toOperationNode();if(A$1(t))return t(Je$1()).toOperationNode();throw new Error(`invalid aliased expression: ${JSON.stringify(t)}`)}function ot$1(t){return Dr(t)||Pr(t)||A$1(t)}function Xe$1(t){return _(t)?t.map(e=>Ze$1(e)):[Ze$1(t)]}function Ze$1(t){return E$2(t)?tr$1(t):er$1(t)}function tr$1(t){const e=" as ";if(t.includes(e)){const[i,n]=t.split(e).map(ir);return le.create(v$2(i),w$2.create(n))}else return v$2(t)}function v$2(t){const e=".";if(t.includes(e)){const[i,n]=t.split(e).map(ir);return he.createWithSchema(i,n)}else return he.create(t)}function ir(t){return t.trim()}const rr$1=r({is(t){return t.kind==="AddColumnNode"},create(t){return r({kind:"AddColumnNode",column:t})}}),y$1=r({is(t){return t.kind==="ColumnDefinitionNode"},create(t,e){return r({kind:"ColumnDefinitionNode",column:O$1.create(t),dataType:e})},cloneWithFrontModifier(t,e){return r({...t,frontModifiers:t.frontModifiers?r([...t.frontModifiers,e]):[e]})},cloneWithEndModifier(t,e){return r({...t,endModifiers:t.endModifiers?r([...t.endModifiers,e]):[e]})},cloneWith(t,e){return r({...t,...e})}}),nr$1=r({is(t){return t.kind==="DropColumnNode"},create(t){return r({kind:"DropColumnNode",column:O$1.create(t)})}}),sr$1=r({is(t){return t.kind==="RenameColumnNode"},create(t,e){return r({kind:"RenameColumnNode",column:O$1.create(t),renameTo:O$1.create(e)})}}),ti=r({is(t){return t.kind==="CheckConstraintNode"},create(t,e){return r({kind:"CheckConstraintNode",expression:t,name:e?w$2.create(e):void 0})}}),Gn=["no action","restrict","cascade","set null","set default"],lt$1=r({is(t){return t.kind==="ReferencesNode"},create(t,e){return r({kind:"ReferencesNode",table:t,columns:r([...e])})},cloneWithOnDelete(t,e){return r({...t,onDelete:e})},cloneWithOnUpdate(t,e){return r({...t,onUpdate:e})}});function or$1(t){return L$2(t)?t.toOperationNode():K$2.createImmediate(t)}const dt$1=r({is(t){return t.kind==="GeneratedNode"},create(t){return r({kind:"GeneratedNode",...t})},createWithExpression(t){return r({kind:"GeneratedNode",always:!0,expression:t})},cloneWith(t,e){return r({...t,...e})}}),zn=r({is(t){return t.kind==="DefaultValueNode"},create(t){return r({kind:"DefaultValueNode",defaultValue:t})}});function bt$1(t){if(Gn.includes(t))return t;throw new Error(`invalid OnModifyForeignAction ${t}`)}let N$1 = class N{#e;constructor(e){this.#e=e;}autoIncrement(){return new N(y$1.cloneWith(this.#e,{autoIncrement:!0}))}identity(){return new N(y$1.cloneWith(this.#e,{identity:!0}))}primaryKey(){return new N(y$1.cloneWith(this.#e,{primaryKey:!0}))}references(e){const i=ee$1(e);if(!i.table||jt$1.is(i.column))throw new Error(`invalid call references('${e}'). The reference must have format table.column or schema.table.column`);return new N(y$1.cloneWith(this.#e,{references:lt$1.create(i.table,[i.column])}))}onDelete(e){if(!this.#e.references)throw new Error("on delete constraint can only be added for foreign keys");return new N(y$1.cloneWith(this.#e,{references:lt$1.cloneWithOnDelete(this.#e.references,bt$1(e))}))}onUpdate(e){if(!this.#e.references)throw new Error("on update constraint can only be added for foreign keys");return new N(y$1.cloneWith(this.#e,{references:lt$1.cloneWithOnUpdate(this.#e.references,bt$1(e))}))}unique(){return new N(y$1.cloneWith(this.#e,{unique:!0}))}notNull(){return new N(y$1.cloneWith(this.#e,{notNull:!0}))}unsigned(){return new N(y$1.cloneWith(this.#e,{unsigned:!0}))}defaultTo(e){return new N(y$1.cloneWith(this.#e,{defaultTo:zn.create(or$1(e))}))}check(e){return new N(y$1.cloneWith(this.#e,{check:ti.create(e.toOperationNode())}))}generatedAlwaysAs(e){return new N(y$1.cloneWith(this.#e,{generated:dt$1.createWithExpression(e.toOperationNode())}))}generatedAlwaysAsIdentity(){return new N(y$1.cloneWith(this.#e,{generated:dt$1.create({identity:!0,always:!0})}))}generatedByDefaultAsIdentity(){return new N(y$1.cloneWith(this.#e,{generated:dt$1.create({identity:!0,byDefault:!0})}))}stored(){if(!this.#e.generated)throw new Error("stored() can only be called after generatedAlwaysAs");return new N(y$1.cloneWith(this.#e,{generated:dt$1.cloneWith(this.#e.generated,{stored:!0})}))}modifyFront(e){return new N(y$1.cloneWithFrontModifier(this.#e,e.toOperationNode()))}nullsNotDistinct(){return new N(y$1.cloneWith(this.#e,{nullsNotDistinct:!0}))}ifNotExists(){return new N(y$1.cloneWith(this.#e,{ifNotExists:!0}))}modifyEnd(e){return new N(y$1.cloneWithEndModifier(this.#e,e.toOperationNode()))}$call(e){return e(this)}toOperationNode(){return this.#e}};u(N$1,"don't await ColumnDefinitionBuilder instances directly.");const ar$1=r({is(t){return t.kind==="ModifyColumnNode"},create(t){return r({kind:"ModifyColumnNode",column:t})}}),qt$1=r({is(t){return t.kind==="ForeignKeyConstraintNode"},create(t,e,i,n){return r({kind:"ForeignKeyConstraintNode",columns:t,references:lt$1.create(e,i),name:n?w$2.create(n):void 0})},cloneWith(t,e){return r({...t,...e})}});class Pe{#e;constructor(e){this.#e=e;}onDelete(e){return new Pe(qt$1.cloneWith(this.#e,{onDelete:bt$1(e)}))}onUpdate(e){return new Pe(qt$1.cloneWith(this.#e,{onUpdate:bt$1(e)}))}$call(e){return e(this)}toOperationNode(){return this.#e}}u(Pe,"don't await ForeignKeyConstraintBuilder instances directly.");const pt$1=r({is(t){return t.kind==="AddConstraintNode"},create(t){return r({kind:"AddConstraintNode",constraint:t})}}),ii=r({is(t){return t.kind==="UniqueConstraintNode"},create(t,e,i){return r({kind:"UniqueConstraintNode",columns:r(t.map(O$1.create)),name:e?w$2.create(e):void 0,nullsNotDistinct:i})},cloneWith(t,e){return r({...t,...e})}}),ft$1=r({is(t){return t.kind==="DropConstraintNode"},create(t){return r({kind:"DropConstraintNode",constraintName:w$2.create(t)})},cloneWith(t,e){return r({...t,...e})}}),Ve$1=r({is(t){return t.kind==="AlterColumnNode"},create(t,e,i){return r({kind:"AlterColumnNode",column:O$1.create(t),[e]:i})}});class ri{#e;constructor(e){this.#e=e;}setDataType(e){return new xe(Ve$1.create(this.#e,"dataType",ye(e)))}setDefault(e){return new xe(Ve$1.create(this.#e,"setDefault",or$1(e)))}dropDefault(){return new xe(Ve$1.create(this.#e,"dropDefault",!0))}setNotNull(){return new xe(Ve$1.create(this.#e,"setNotNull",!0))}dropNotNull(){return new xe(Ve$1.create(this.#e,"dropNotNull",!0))}$call(e){return e(this)}}u(ri,"don't await AlterColumnBuilder instances");class xe{#e;constructor(e){this.#e=e;}toOperationNode(){return this.#e}}u(xe,"don't await AlteredColumnBuilder instances");class pe{#e;constructor(e){this.#e=r(e);}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}}u(pe,"don't await AlterTableExecutor instances directly. To execute the query you need to call `execute`");class _e{#e;constructor(e){this.#e=r(e);}onDelete(e){return new _e({...this.#e,constraintBuilder:this.#e.constraintBuilder.onDelete(e)})}onUpdate(e){return new _e({...this.#e,constraintBuilder:this.#e.constraintBuilder.onUpdate(e)})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(c.cloneWithTableProps(this.#e.node,{addConstraint:pt$1.create(this.#e.constraintBuilder.toOperationNode())}),this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}}u(_e,"don't await AlterTableAddForeignKeyConstraintBuilder instances directly. To execute the query you need to call `execute`");class Te{#e;constructor(e){this.#e=r(e);}ifExists(){return new Te({...this.#e,node:c.cloneWithTableProps(this.#e.node,{dropConstraint:ft$1.cloneWith(this.#e.node.dropConstraint,{ifExists:!0})})})}cascade(){return new Te({...this.#e,node:c.cloneWithTableProps(this.#e.node,{dropConstraint:ft$1.cloneWith(this.#e.node.dropConstraint,{modifier:"cascade"})})})}restrict(){return new Te({...this.#e,node:c.cloneWithTableProps(this.#e.node,{dropConstraint:ft$1.cloneWith(this.#e.node.dropConstraint,{modifier:"restrict"})})})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}}u(Te,"don't await AlterTableDropConstraintBuilder instances directly. To execute the query you need to call `execute`");const hr=r({is(t){return t.kind==="PrimaryKeyConstraintNode"},create(t,e){return r({kind:"PrimaryKeyConstraintNode",columns:r(t.map(O$1.create)),name:e?w$2.create(e):void 0})}}),ve=r({is(t){return t.kind==="AddIndexNode"},create(t){return r({kind:"AddIndexNode",name:w$2.create(t)})},cloneWith(t,e){return r({...t,...e})},cloneWithColumns(t,e){return r({...t,columns:[...t.columns||[],...e]})}});let ne$2 = class ne{#e;constructor(e){this.#e=r(e);}unique(){return new ne({...this.#e,node:c.cloneWithTableProps(this.#e.node,{addIndex:ve.cloneWith(this.#e.node.addIndex,{unique:!0})})})}column(e){return new ne({...this.#e,node:c.cloneWithTableProps(this.#e.node,{addIndex:ve.cloneWithColumns(this.#e.node.addIndex,[wt$1(e)])})})}columns(e){return new ne({...this.#e,node:c.cloneWithTableProps(this.#e.node,{addIndex:ve.cloneWithColumns(this.#e.node.addIndex,e.map(wt$1))})})}expression(e){return new ne({...this.#e,node:c.cloneWithTableProps(this.#e.node,{addIndex:ve.cloneWithColumns(this.#e.node.addIndex,[e.toOperationNode()])})})}using(e){return new ne({...this.#e,node:c.cloneWithTableProps(this.#e.node,{addIndex:ve.cloneWith(this.#e.node.addIndex,{using:b$2.createWithSql(e)})})})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}};u(ne$2,"don't await AlterTableAddIndexBuilder instances directly. To execute the query you need to call `execute`");let at$1 = class at{#e;constructor(e){this.#e=e;}toOperationNode(){return this.#e}nullsNotDistinct(){return new at(ii.cloneWith(this.#e,{nullsNotDistinct:!0}))}};u(at$1,"don't await UniqueConstraintNodeBuilder instances directly.");class ur{#e;constructor(e){this.#e=r(e);}renameTo(e){return new pe({...this.#e,node:c.cloneWithTableProps(this.#e.node,{renameTo:v$2(e)})})}setSchema(e){return new pe({...this.#e,node:c.cloneWithTableProps(this.#e.node,{setSchema:w$2.create(e)})})}alterColumn(e,i){const n=i(new ri(e));return new J$2({...this.#e,node:c.cloneWithColumnAlteration(this.#e.node,n.toOperationNode())})}dropColumn(e){return new J$2({...this.#e,node:c.cloneWithColumnAlteration(this.#e.node,nr$1.create(e))})}renameColumn(e,i){return new J$2({...this.#e,node:c.cloneWithColumnAlteration(this.#e.node,sr$1.create(e,i))})}addColumn(e,i,n=ae){const s=n(new N$1(y$1.create(e,ye(i))));return new J$2({...this.#e,node:c.cloneWithColumnAlteration(this.#e.node,rr$1.create(s.toOperationNode()))})}modifyColumn(e,i,n=ae){const s=n(new N$1(y$1.create(e,ye(i))));return new J$2({...this.#e,node:c.cloneWithColumnAlteration(this.#e.node,ar$1.create(s.toOperationNode()))})}addUniqueConstraint(e,i,n=ae){const s=n(new at$1(ii.create(i,e)));return new pe({...this.#e,node:c.cloneWithTableProps(this.#e.node,{addConstraint:pt$1.create(s.toOperationNode())})})}addCheckConstraint(e,i){return new pe({...this.#e,node:c.cloneWithTableProps(this.#e.node,{addConstraint:pt$1.create(ti.create(i.toOperationNode(),e))})})}addForeignKeyConstraint(e,i,n,s){return new _e({...this.#e,constraintBuilder:new Pe(qt$1.create(i.map(O$1.create),v$2(n),s.map(O$1.create),e))})}addPrimaryKeyConstraint(e,i){return new pe({...this.#e,node:c.cloneWithTableProps(this.#e.node,{addConstraint:pt$1.create(hr.create(i,e))})})}dropConstraint(e){return new Te({...this.#e,node:c.cloneWithTableProps(this.#e.node,{dropConstraint:ft$1.create(e)})})}addIndex(e){return new ne$2({...this.#e,node:c.cloneWithTableProps(this.#e.node,{addIndex:ve.create(e)})})}dropIndex(e){return new pe({...this.#e,node:c.cloneWithTableProps(this.#e.node,{dropIndex:Ue$1.create(e)})})}$call(e){return e(this)}}u(ur,"don't await AlterTableBuilder instances");let J$2 = class J{#e;constructor(e){this.#e=r(e);}alterColumn(e,i){const n=i(new ri(e));return new J({...this.#e,node:c.cloneWithColumnAlteration(this.#e.node,n.toOperationNode())})}dropColumn(e){return new J({...this.#e,node:c.cloneWithColumnAlteration(this.#e.node,nr$1.create(e))})}renameColumn(e,i){return new J({...this.#e,node:c.cloneWithColumnAlteration(this.#e.node,sr$1.create(e,i))})}addColumn(e,i,n=ae){const s=n(new N$1(y$1.create(e,ye(i))));return new J({...this.#e,node:c.cloneWithColumnAlteration(this.#e.node,rr$1.create(s.toOperationNode()))})}modifyColumn(e,i,n=ae){const s=n(new N$1(y$1.create(e,ye(i))));return new J({...this.#e,node:c.cloneWithColumnAlteration(this.#e.node,ar$1.create(s.toOperationNode()))})}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}};u(J$2,"don't await AlterTableColumnAlteringBuilder instances directly. To execute the query you need to call `execute`");class dr extends Ki{transformValue(e){return {...super.transformValue(e),immediate:!0}}}class F{#e;constructor(e){this.#e=r(e);}ifNotExists(){return new F({...this.#e,node:X$2.cloneWith(this.#e.node,{ifNotExists:!0})})}unique(){return new F({...this.#e,node:X$2.cloneWith(this.#e.node,{unique:!0})})}nullsNotDistinct(){return new F({...this.#e,node:X$2.cloneWith(this.#e.node,{nullsNotDistinct:!0})})}on(e){return new F({...this.#e,node:X$2.cloneWith(this.#e.node,{table:v$2(e)})})}column(e){return new F({...this.#e,node:X$2.cloneWithColumns(this.#e.node,[wt$1(e)])})}columns(e){return new F({...this.#e,node:X$2.cloneWithColumns(this.#e.node,e.map(wt$1))})}expression(e){return new F({...this.#e,node:X$2.cloneWithColumns(this.#e.node,[e.toOperationNode()])})}using(e){return new F({...this.#e,node:X$2.cloneWith(this.#e.node,{using:b$2.createWithSql(e)})})}where(...e){const i=new dr;return new F({...this.#e,node:a.cloneWithWhere(this.#e.node,i.transformNode(q$3(e)))})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}}u(F,"don't await CreateIndexBuilder instances directly. To execute the query you need to call `execute`");let St$1 = class St{#e;constructor(e){this.#e=r(e);}ifNotExists(){return new St({...this.#e,node:Ai.cloneWith(this.#e.node,{ifNotExists:!0})})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}};u(St$1,"don't await CreateSchemaBuilder instances directly. To execute the query you need to call `execute`");function Hn(t){if(Rr.includes(t))return t;throw new Error(`invalid OnCommitAction ${t}`)}let T$3 = class T{#e;constructor(e){this.#e=r(e);}temporary(){return new T({...this.#e,node:R$3.cloneWith(this.#e.node,{temporary:!0})})}onCommit(e){return new T({...this.#e,node:R$3.cloneWith(this.#e.node,{onCommit:Hn(e)})})}ifNotExists(){return new T({...this.#e,node:R$3.cloneWith(this.#e.node,{ifNotExists:!0})})}addColumn(e,i,n=ae){const s=n(new N$1(y$1.create(e,ye(i))));return new T({...this.#e,node:R$3.cloneWithColumn(this.#e.node,s.toOperationNode())})}addPrimaryKeyConstraint(e,i){return new T({...this.#e,node:R$3.cloneWithConstraint(this.#e.node,hr.create(i,e))})}addUniqueConstraint(e,i,n=ae){const s=n(new at$1(ii.create(i,e)));return new T({...this.#e,node:R$3.cloneWithConstraint(this.#e.node,s.toOperationNode())})}addCheckConstraint(e,i){return new T({...this.#e,node:R$3.cloneWithConstraint(this.#e.node,ti.create(i.toOperationNode(),e))})}addForeignKeyConstraint(e,i,n,s,o=ae){const x=o(new Pe(qt$1.create(i.map(O$1.create),v$2(n),s.map(O$1.create),e)));return new T({...this.#e,node:R$3.cloneWithConstraint(this.#e.node,x.toOperationNode())})}modifyFront(e){return new T({...this.#e,node:R$3.cloneWithFrontModifier(this.#e.node,e.toOperationNode())})}modifyEnd(e){return new T({...this.#e,node:R$3.cloneWithEndModifier(this.#e.node,e.toOperationNode())})}as(e){return new T({...this.#e,node:R$3.cloneWith(this.#e.node,{selectQuery:we(e)})})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}};u(T$3,"don't await CreateTableBuilder instances directly. To execute the query you need to call `execute`");let Ie$1 = class Ie{#e;constructor(e){this.#e=r(e);}on(e){return new Ie({...this.#e,node:Ue$1.cloneWith(this.#e.node,{table:v$2(e)})})}ifExists(){return new Ie({...this.#e,node:Ue$1.cloneWith(this.#e.node,{ifExists:!0})})}cascade(){return new Ie({...this.#e,node:Ue$1.cloneWith(this.#e.node,{cascade:!0})})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}};u(Ie$1,"don't await DropIndexBuilder instances directly. To execute the query you need to call `execute`");let et$1 = class et{#e;constructor(e){this.#e=r(e);}ifExists(){return new et({...this.#e,node:Pt$1.cloneWith(this.#e.node,{ifExists:!0})})}cascade(){return new et({...this.#e,node:Pt$1.cloneWith(this.#e.node,{cascade:!0})})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}};u(et$1,"don't await DropSchemaBuilder instances directly. To execute the query you need to call `execute`");let tt$1 = class tt{#e;constructor(e){this.#e=r(e);}ifExists(){return new tt({...this.#e,node:Mt$1.cloneWith(this.#e.node,{ifExists:!0})})}cascade(){return new tt({...this.#e,node:Mt$1.cloneWith(this.#e.node,{cascade:!0})})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}};u(tt$1,"don't await DropTableBuilder instances directly. To execute the query you need to call `execute`");const ie=r({is(t){return t.kind==="CreateViewNode"},create(t){return r({kind:"CreateViewNode",name:ue.create(t)})},cloneWith(t,e){return r({...t,...e})}});class Yn{#e=new dr;transformQuery(e){return this.#e.transformNode(e.node)}transformResult(e){return Promise.resolve(e.result)}}let Z$1 = class Z{#e;constructor(e){this.#e=r(e);}temporary(){return new Z({...this.#e,node:ie.cloneWith(this.#e.node,{temporary:!0})})}materialized(){return new Z({...this.#e,node:ie.cloneWith(this.#e.node,{materialized:!0})})}ifNotExists(){return new Z({...this.#e,node:ie.cloneWith(this.#e.node,{ifNotExists:!0})})}orReplace(){return new Z({...this.#e,node:ie.cloneWith(this.#e.node,{orReplace:!0})})}columns(e){return new Z({...this.#e,node:ie.cloneWith(this.#e.node,{columns:e.map(Ji)})})}as(e){const i=e.withPlugin(new Yn).toOperationNode();return new Z({...this.#e,node:ie.cloneWith(this.#e.node,{as:i})})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}};u(Z$1,"don't await CreateViewBuilder instances directly. To execute the query you need to call `execute`");const mt$1=r({is(t){return t.kind==="DropViewNode"},create(t){return r({kind:"DropViewNode",name:ue.create(t)})},cloneWith(t,e){return r({...t,...e})}});class Se{#e;constructor(e){this.#e=r(e);}materialized(){return new Se({...this.#e,node:mt$1.cloneWith(this.#e.node,{materialized:!0})})}ifExists(){return new Se({...this.#e,node:mt$1.cloneWith(this.#e.node,{ifExists:!0})})}cascade(){return new Se({...this.#e,node:mt$1.cloneWith(this.#e.node,{cascade:!0})})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}}u(Se,"don't await DropViewBuilder instances directly. To execute the query you need to call `execute`");const cr$1=r({is(t){return t.kind==="CreateTypeNode"},create(t){return r({kind:"CreateTypeNode",name:t})},cloneWithEnum(t,e){return r({...t,enum:Gt$1.create(e.map(i=>K$2.createImmediate(i)))})}});let Et$1 = class Et{#e;constructor(e){this.#e=r(e);}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}asEnum(e){return new Et({...this.#e,node:cr$1.cloneWithEnum(this.#e.node,e)})}$call(e){return e(this)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}};u(Et$1,"don't await CreateTypeBuilder instances directly. To execute the query you need to call `execute`");const lr=r({is(t){return t.kind==="DropTypeNode"},create(t){return r({kind:"DropTypeNode",name:t})},cloneWith(t,e){return r({...t,...e})}});let At$1 = class At{#e;constructor(e){this.#e=r(e);}ifExists(){return new At({...this.#e,node:lr.cloneWith(this.#e.node,{ifExists:!0})})}$call(e){return e(this)}toOperationNode(){return this.#e.executor.transformQuery(this.#e.node,this.#e.queryId)}compile(){return this.#e.executor.compileQuery(this.toOperationNode(),this.#e.queryId)}async execute(){await this.#e.executor.executeQuery(this.compile(),this.#e.queryId);}};u(At$1,"don't await DropTypeBuilder instances directly. To execute the query you need to call `execute`");function Ti(t){const e=".";if(t.includes(e)){const i=t.split(e).map(Xn);if(i.length===2)return ue.createWithSchema(i[0],i[1]);throw new Error(`invalid schemable identifier ${t}`)}else return ue.create(t)}function Xn(t){return t.trim()}let Ge$1 = class Ge{#e;constructor(e){this.#e=e;}createTable(e){return new T$3({queryId:l(),executor:this.#e,node:R$3.create(v$2(e))})}dropTable(e){return new tt$1({queryId:l(),executor:this.#e,node:Mt$1.create(v$2(e))})}createIndex(e){return new F({queryId:l(),executor:this.#e,node:X$2.create(e)})}dropIndex(e){return new Ie$1({queryId:l(),executor:this.#e,node:Ue$1.create(e)})}createSchema(e){return new St$1({queryId:l(),executor:this.#e,node:Ai.create(e)})}dropSchema(e){return new et$1({queryId:l(),executor:this.#e,node:Pt$1.create(e)})}alterTable(e){return new ur({queryId:l(),executor:this.#e,node:c.create(v$2(e))})}createView(e){return new Z$1({queryId:l(),executor:this.#e,node:ie.create(e)})}dropView(e){return new Se({queryId:l(),executor:this.#e,node:mt$1.create(e)})}createType(e){return new Et$1({queryId:l(),executor:this.#e,node:cr$1.create(Ti(e))})}dropType(e){return new At$1({queryId:l(),executor:this.#e,node:lr.create(Ti(e))})}withPlugin(e){return new Ge(this.#e.withPlugin(e))}withoutPlugins(){return new Ge(this.#e.withoutPlugins())}withSchema(e){return new Ge(this.#e.withPluginAtFront(new st$1(e)))}};class Zn{ref(e){return new Qr(e)}}class _n{#e;constructor(e){this.#e=e;}async provideConnection(e){const i=await this.#e.acquireConnection();try{return await e(i)}finally{await this.#e.releaseConnection(i);}}}class me extends Gi{#e;#t;#i;constructor(e,i,n,s=[]){super(s),this.#e=e,this.#t=i,this.#i=n;}get adapter(){return this.#t}compileQuery(e){return this.#e.compileQuery(e)}provideConnection(e){return this.#i.provideConnection(e)}withPlugins(e){return new me(this.#e,this.#t,this.#i,[...this.plugins,...e])}withPlugin(e){return new me(this.#e,this.#t,this.#i,[...this.plugins,e])}withPluginAtFront(e){return new me(this.#e,this.#t,this.#i,[e,...this.plugins])}withConnectionProvider(e){return new me(this.#e,this.#t,e,[...this.plugins])}withoutPlugins(){return new me(this.#e,this.#t,this.#i,[])}}function Ii(){return typeof performance<"u"&&A$1(performance.now)?performance.now():Date.now()}class es{#e;#t;#i;#r;#n;#o=new WeakSet;constructor(e,i){this.#r=!1,this.#e=e,this.#t=i;}async init(){if(this.#n)throw new Error("driver has already been destroyed");this.#i||(this.#i=this.#e.init().then(()=>{this.#r=!0;}).catch(e=>(this.#i=void 0,Promise.reject(e)))),await this.#i;}async acquireConnection(){if(this.#n)throw new Error("driver has already been destroyed");this.#r||await this.init();const e=await this.#e.acquireConnection();return this.#o.has(e)||(this.#s()&&this.#a(e),this.#o.add(e)),e}async releaseConnection(e){await this.#e.releaseConnection(e);}beginTransaction(e,i){return this.#e.beginTransaction(e,i)}commitTransaction(e){return this.#e.commitTransaction(e)}rollbackTransaction(e){return this.#e.rollbackTransaction(e)}async destroy(){this.#i&&(await this.#i,this.#n||(this.#n=this.#e.destroy().catch(e=>(this.#n=void 0,Promise.reject(e)))),await this.#n);}#s(){return this.#t.isLevelEnabled("query")||this.#t.isLevelEnabled("error")}#a(e){const i=e.executeQuery;e.executeQuery=async n=>{let s;const o=Ii();try{return await i.call(e,n)}catch(x){throw s=x,await this.#h(x,n,o),x}finally{s||await this.#d(n,o);}};}async#h(e,i,n){await this.#t.error(()=>({level:"error",error:e,query:i,queryDurationMillis:this.#u(n)}));}async#d(e,i){await this.#t.query(()=>({level:"query",query:e,queryDurationMillis:this.#u(i)}));}#u(e){return Ii()-e}}const ts=()=>{};class pr{#e;#t;constructor(e){this.#e=e;}async provideConnection(e){for(;this.#t;)await this.#t.catch(ts);return this.#t=this.#i(e).finally(()=>{this.#t=void 0;}),this.#t}async#i(e){return await e(this.#e)}}const is=["read uncommitted","read committed","repeatable read","serializable","snapshot"];r(["query","error"]);class rs{#e;#t;constructor(e){A$1(e)?(this.#t=e,this.#e=r({query:!0,error:!0})):(this.#t=ns,this.#e=r({query:e.includes("query"),error:e.includes("error")}));}isLevelEnabled(e){return this.#e[e]}async query(e){this.#e.query&&await this.#t(e());}async error(e){this.#e.error&&await this.#t(e());}}function ns(t){t.level==="query"?(console.log(`kysely:query: ${t.query.sql}`),console.log(`kysely:query: duration: ${t.queryDurationMillis.toFixed(1)}ms`)):t.level==="error"&&(t.error instanceof Error?console.error(`kysely:error: ${t.error.stack??t.error.message}`):console.error(`kysely:error: ${JSON.stringify({error:t.error,query:t.query.sql,queryDurationMillis:t.queryDurationMillis})}`));}function ss(t){return $$2(t)&&A$1(t.compile)}let se$1 = class se extends re$1{#e;constructor(e){let i,n;if(os(e))i={executor:e.executor},n={...e};else {const s=e.dialect,o=s.createDriver(),x=s.createQueryCompiler(),C=s.createAdapter(),H=new rs(e.log??[]),ni=new es(o,H),xr=new _n(ni),si=new me(x,C,xr,e.plugins??[]);i={executor:si},n={config:e,executor:si,dialect:s,driver:ni};}super(i),this.#e=r(n);}get schema(){return new Ge$1(this.#e.executor)}get dynamic(){return new Zn}get introspection(){return this.#e.dialect.createIntrospector(this.withoutPlugins())}case(e){return new Zi({node:j.create(oe$1(e)?void 0:we(e))})}get fn(){return Xi()}transaction(){return new Lt$1({...this.#e})}connection(){return new fr({...this.#e})}withPlugin(e){return new se({...this.#e,executor:this.#e.executor.withPlugin(e)})}withoutPlugins(){return new se({...this.#e,executor:this.#e.executor.withoutPlugins()})}withSchema(e){return new se({...this.#e,executor:this.#e.executor.withPluginAtFront(new st$1(e))})}withTables(){return new se({...this.#e})}async destroy(){await this.#e.driver.destroy();}get isTransaction(){return !1}getExecutor(){return this.#e.executor}executeQuery(e,i=l()){const n=ss(e)?e.compile():e;return this.getExecutor().executeQuery(n,i)}};let We$1 = class We extends se$1{#e;constructor(e){super(e),this.#e=e;}get isTransaction(){return !0}transaction(){throw new Error("calling the transaction method for a Transaction is not supported")}connection(){throw new Error("calling the connection method for a Transaction is not supported")}async destroy(){throw new Error("calling the destroy method for a Transaction is not supported")}withPlugin(e){return new We({...this.#e,executor:this.#e.executor.withPlugin(e)})}withoutPlugins(){return new We({...this.#e,executor:this.#e.executor.withoutPlugins()})}withSchema(e){return new We({...this.#e,executor:this.#e.executor.withPluginAtFront(new st$1(e))})}withTables(){return new We({...this.#e})}};function os(t){return $$2(t)&&$$2(t.config)&&$$2(t.driver)&&$$2(t.executor)&&$$2(t.dialect)}class fr{#e;constructor(e){this.#e=r(e);}async execute(e){return this.#e.executor.provideConnection(async i=>{const n=this.#e.executor.withConnectionProvider(new pr(i)),s=new se$1({...this.#e,executor:n});return await e(s)})}}u(fr,"don't await ConnectionBuilder instances directly. To execute the query you need to call the `execute` method");let Lt$1 = class Lt{#e;constructor(e){this.#e=r(e);}setIsolationLevel(e){return new Lt({...this.#e,isolationLevel:e})}async execute(e){const{isolationLevel:i,...n}=this.#e,s={isolationLevel:i};return as(s),this.#e.executor.provideConnection(async o=>{const x=this.#e.executor.withConnectionProvider(new pr(o)),C=new We$1({...n,executor:x});try{await this.#e.driver.beginTransaction(o,s);const H=await e(C);return await this.#e.driver.commitTransaction(o),H}catch(H){throw await this.#e.driver.rollbackTransaction(o),H}})}};u(Lt$1,"don't await TransactionBuilder instances directly. To execute the transaction you need to call the `execute` method");function as(t){if(t.isolationLevel&&!is.includes(t.isolationLevel))throw new Error(`invalid transaction isolation level ${t.isolationLevel}`)}class Ee{#e;constructor(e){this.#e=r(e);}get expressionType(){}get isRawBuilder(){return !0}as(e){return new mr(this,e)}$castTo(){return new Ee({...this.#e})}$notNull(){return new Ee(this.#e)}withPlugin(e){return new Ee({...this.#e,plugins:this.#e.plugins!==void 0?r([...this.#e.plugins,e]):r([e])})}toOperationNode(){return this.#i(this.#t())}compile(e){return this.#r(this.#t(e))}async execute(e){const i=this.#t(e);return i.executeQuery(this.#r(i),this.#e.queryId)}#t(e){const i=e!==void 0?e.getExecutor():It$1;return this.#e.plugins!==void 0?i.withPlugins(this.#e.plugins):i}#i(e){return e.transformQuery(this.#e.rawNode,this.#e.queryId)}#r(e){return e.compileQuery(this.#i(e),this.#e.queryId)}}function te$1(t){return new Ee(t)}u(Ee,"don't await RawBuilder instances directly. To execute the query you need to call `execute`");class mr{#e;#t;constructor(e,i){this.#e=e,this.#t=i;}get expression(){return this.#e}get alias(){return this.#t}get rawBuilder(){return this.#e}toOperationNode(){return le.create(this.#e.toOperationNode(),L$2(this.#t)?this.#t.toOperationNode():w$2.create(this.#t))}}u(mr,"don't await AliasedRawBuilder instances directly. AliasedRawBuilder should never be executed directly since it's always a part of another query.");const Ae=Object.assign((t,...e)=>te$1({queryId:l(),rawNode:b$2.create(t,e?.map(Si)??[])}),{ref(t){return te$1({queryId:l(),rawNode:b$2.createWithChild(ee$1(t))})},val(t){return te$1({queryId:l(),rawNode:b$2.createWithChild(W$3(t))})},value(t){return this.val(t)},table(t){return te$1({queryId:l(),rawNode:b$2.createWithChild(v$2(t))})},id(...t){const e=new Array(t.length+1).fill(".");return e[0]="",e[e.length-1]="",te$1({queryId:l(),rawNode:b$2.create(e,t.map(w$2.create))})},lit(t){return te$1({queryId:l(),rawNode:b$2.createWithChild(K$2.createImmediate(t))})},literal(t){return this.lit(t)},raw(t){return te$1({queryId:l(),rawNode:b$2.createWithSql(t)})},join(t,e=Ae`, `){const i=new Array(2*t.length-1),n=e.toOperationNode();for(let s=0;s<t.length;++s)i[2*s]=Si(t[s]),s!==t.length-1&&(i[2*s+1]=n);return te$1({queryId:l(),rawNode:b$2.createWithChildren(i)})}});function Si(t){return L$2(t)?t.toOperationNode():W$3(t)}class hs{nodeStack=[];get parentNode(){return this.nodeStack[this.nodeStack.length-2]}#e=r({AliasNode:this.visitAlias.bind(this),ColumnNode:this.visitColumn.bind(this),IdentifierNode:this.visitIdentifier.bind(this),SchemableIdentifierNode:this.visitSchemableIdentifier.bind(this),RawNode:this.visitRaw.bind(this),ReferenceNode:this.visitReference.bind(this),SelectQueryNode:this.visitSelectQuery.bind(this),SelectionNode:this.visitSelection.bind(this),TableNode:this.visitTable.bind(this),FromNode:this.visitFrom.bind(this),SelectAllNode:this.visitSelectAll.bind(this),AndNode:this.visitAnd.bind(this),OrNode:this.visitOr.bind(this),ValueNode:this.visitValue.bind(this),ValueListNode:this.visitValueList.bind(this),PrimitiveValueListNode:this.visitPrimitiveValueList.bind(this),ParensNode:this.visitParens.bind(this),JoinNode:this.visitJoin.bind(this),OperatorNode:this.visitOperator.bind(this),WhereNode:this.visitWhere.bind(this),InsertQueryNode:this.visitInsertQuery.bind(this),DeleteQueryNode:this.visitDeleteQuery.bind(this),ReturningNode:this.visitReturning.bind(this),CreateTableNode:this.visitCreateTable.bind(this),AddColumnNode:this.visitAddColumn.bind(this),ColumnDefinitionNode:this.visitColumnDefinition.bind(this),DropTableNode:this.visitDropTable.bind(this),DataTypeNode:this.visitDataType.bind(this),OrderByNode:this.visitOrderBy.bind(this),OrderByItemNode:this.visitOrderByItem.bind(this),GroupByNode:this.visitGroupBy.bind(this),GroupByItemNode:this.visitGroupByItem.bind(this),UpdateQueryNode:this.visitUpdateQuery.bind(this),ColumnUpdateNode:this.visitColumnUpdate.bind(this),LimitNode:this.visitLimit.bind(this),OffsetNode:this.visitOffset.bind(this),OnConflictNode:this.visitOnConflict.bind(this),OnDuplicateKeyNode:this.visitOnDuplicateKey.bind(this),CreateIndexNode:this.visitCreateIndex.bind(this),DropIndexNode:this.visitDropIndex.bind(this),ListNode:this.visitList.bind(this),PrimaryKeyConstraintNode:this.visitPrimaryKeyConstraint.bind(this),UniqueConstraintNode:this.visitUniqueConstraint.bind(this),ReferencesNode:this.visitReferences.bind(this),CheckConstraintNode:this.visitCheckConstraint.bind(this),WithNode:this.visitWith.bind(this),CommonTableExpressionNode:this.visitCommonTableExpression.bind(this),CommonTableExpressionNameNode:this.visitCommonTableExpressionName.bind(this),HavingNode:this.visitHaving.bind(this),CreateSchemaNode:this.visitCreateSchema.bind(this),DropSchemaNode:this.visitDropSchema.bind(this),AlterTableNode:this.visitAlterTable.bind(this),DropColumnNode:this.visitDropColumn.bind(this),RenameColumnNode:this.visitRenameColumn.bind(this),AlterColumnNode:this.visitAlterColumn.bind(this),ModifyColumnNode:this.visitModifyColumn.bind(this),AddConstraintNode:this.visitAddConstraint.bind(this),DropConstraintNode:this.visitDropConstraint.bind(this),ForeignKeyConstraintNode:this.visitForeignKeyConstraint.bind(this),CreateViewNode:this.visitCreateView.bind(this),DropViewNode:this.visitDropView.bind(this),GeneratedNode:this.visitGenerated.bind(this),DefaultValueNode:this.visitDefaultValue.bind(this),OnNode:this.visitOn.bind(this),ValuesNode:this.visitValues.bind(this),SelectModifierNode:this.visitSelectModifier.bind(this),CreateTypeNode:this.visitCreateType.bind(this),DropTypeNode:this.visitDropType.bind(this),ExplainNode:this.visitExplain.bind(this),DefaultInsertValueNode:this.visitDefaultInsertValue.bind(this),AggregateFunctionNode:this.visitAggregateFunction.bind(this),OverNode:this.visitOver.bind(this),PartitionByNode:this.visitPartitionBy.bind(this),PartitionByItemNode:this.visitPartitionByItem.bind(this),SetOperationNode:this.visitSetOperation.bind(this),BinaryOperationNode:this.visitBinaryOperation.bind(this),UnaryOperationNode:this.visitUnaryOperation.bind(this),UsingNode:this.visitUsing.bind(this),FunctionNode:this.visitFunction.bind(this),CaseNode:this.visitCase.bind(this),WhenNode:this.visitWhen.bind(this),JSONReferenceNode:this.visitJSONReference.bind(this),JSONPathNode:this.visitJSONPath.bind(this),JSONPathLegNode:this.visitJSONPathLeg.bind(this),JSONOperatorChainNode:this.visitJSONOperatorChain.bind(this),TupleNode:this.visitTuple.bind(this),MergeQueryNode:this.visitMergeQuery.bind(this),MatchedNode:this.visitMatched.bind(this),AddIndexNode:this.visitAddIndex.bind(this),CastNode:this.visitCast.bind(this),FetchNode:this.visitFetch.bind(this),TopNode:this.visitTop.bind(this),OutputNode:this.visitOutput.bind(this)});visitNode=e=>{this.nodeStack.push(e),this.#e[e.kind](e),this.nodeStack.pop();}}class us extends hs{#e="";#t=[];get numParameters(){return this.#t.length}compileQuery(e){return this.#e="",this.#t=[],this.nodeStack.splice(0,this.nodeStack.length),this.visitNode(e),r({query:e,sql:this.getSql(),parameters:[...this.#t]})}getSql(){return this.#e}visitSelectQuery(e){const i=this.parentNode!==void 0&&!Re.is(this.parentNode)&&!P$1.is(this.parentNode)&&!R$3.is(this.parentNode)&&!ie.is(this.parentNode)&&!Hi.is(this.parentNode);this.parentNode===void 0&&e.explain&&(this.visitNode(e.explain),this.append(" ")),i&&this.append("("),e.with&&(this.visitNode(e.with),this.append(" ")),this.append("select"),e.distinctOn&&(this.append(" "),this.compileDistinctOn(e.distinctOn)),e.frontModifiers?.length&&(this.append(" "),this.compileList(e.frontModifiers," ")),e.top&&(this.append(" "),this.visitNode(e.top)),e.selections&&(this.append(" "),this.compileList(e.selections)),e.from&&(this.append(" "),this.visitNode(e.from)),e.joins&&(this.append(" "),this.compileList(e.joins," ")),e.where&&(this.append(" "),this.visitNode(e.where)),e.groupBy&&(this.append(" "),this.visitNode(e.groupBy)),e.having&&(this.append(" "),this.visitNode(e.having)),e.setOperations&&(this.append(" "),this.compileList(e.setOperations," ")),e.orderBy&&(this.append(" "),this.visitNode(e.orderBy)),e.limit&&(this.append(" "),this.visitNode(e.limit)),e.offset&&(this.append(" "),this.visitNode(e.offset)),e.fetch&&(this.append(" "),this.visitNode(e.fetch)),e.endModifiers?.length&&(this.append(" "),this.compileList(this.sortSelectModifiers([...e.endModifiers])," ")),i&&this.append(")");}visitFrom(e){this.append("from "),this.compileList(e.froms);}visitSelection(e){this.visitNode(e.selection);}visitColumn(e){this.visitNode(e.column);}compileDistinctOn(e){this.append("distinct on ("),this.compileList(e),this.append(")");}compileList(e,i=", "){const n=e.length-1;for(let s=0;s<=n;s++)this.visitNode(e[s]),s<n&&this.append(i);}visitWhere(e){this.append("where "),this.visitNode(e.where);}visitHaving(e){this.append("having "),this.visitNode(e.having);}visitInsertQuery(e){const i=this.nodeStack.find(a.is),n=i!==e;!n&&e.explain&&(this.visitNode(e.explain),this.append(" ")),n&&!S$2.is(i)&&this.append("("),e.with&&(this.visitNode(e.with),this.append(" ")),this.append(e.replace?"replace":"insert"),e.ignore&&this.append(" ignore"),e.top&&(this.append(" "),this.visitNode(e.top)),e.into&&(this.append(" into "),this.visitNode(e.into)),e.columns&&(this.append(" ("),this.compileList(e.columns),this.append(")")),e.output&&(this.append(" "),this.visitNode(e.output)),e.values&&(this.append(" "),this.visitNode(e.values)),e.defaultValues&&(this.append(" "),this.append("default values")),e.onConflict&&(this.append(" "),this.visitNode(e.onConflict)),e.onDuplicateKey&&(this.append(" "),this.visitNode(e.onDuplicateKey)),e.returning&&(this.append(" "),this.visitNode(e.returning)),n&&!S$2.is(i)&&this.append(")");}visitValues(e){this.append("values "),this.compileList(e.values);}visitDeleteQuery(e){const i=this.nodeStack.find(a.is)!==e;!i&&e.explain&&(this.visitNode(e.explain),this.append(" ")),i&&this.append("("),e.with&&(this.visitNode(e.with),this.append(" ")),this.append("delete "),e.top&&(this.visitNode(e.top),this.append(" ")),this.visitNode(e.from),e.output&&(this.append(" "),this.visitNode(e.output)),e.using&&(this.append(" "),this.visitNode(e.using)),e.joins&&(this.append(" "),this.compileList(e.joins," ")),e.where&&(this.append(" "),this.visitNode(e.where)),e.orderBy&&(this.append(" "),this.visitNode(e.orderBy)),e.limit&&(this.append(" "),this.visitNode(e.limit)),e.returning&&(this.append(" "),this.visitNode(e.returning)),i&&this.append(")");}visitReturning(e){this.append("returning "),this.compileList(e.selections);}visitAlias(e){this.visitNode(e.node),this.append(" as "),this.visitNode(e.alias);}visitReference(e){e.table&&(this.visitNode(e.table),this.append(".")),this.visitNode(e.column);}visitSelectAll(e){this.append("*");}visitIdentifier(e){this.append(this.getLeftIdentifierWrapper()),this.compileUnwrappedIdentifier(e),this.append(this.getRightIdentifierWrapper());}compileUnwrappedIdentifier(e){if(!E$2(e.name))throw new Error("a non-string identifier was passed to compileUnwrappedIdentifier.");this.append(this.sanitizeIdentifier(e.name));}visitAnd(e){this.visitNode(e.left),this.append(" and "),this.visitNode(e.right);}visitOr(e){this.visitNode(e.left),this.append(" or "),this.visitNode(e.right);}visitValue(e){e.immediate?this.appendImmediateValue(e.value):this.appendValue(e.value);}visitValueList(e){this.append("("),this.compileList(e.values),this.append(")");}visitTuple(e){this.append("("),this.compileList(e.values),this.append(")");}visitPrimitiveValueList(e){this.append("(");const{values:i}=e;for(let n=0;n<i.length;++n)this.appendValue(i[n]),n!==i.length-1&&this.append(", ");this.append(")");}visitParens(e){this.append("("),this.visitNode(e.node),this.append(")");}visitJoin(e){this.append(cs[e.joinType]),this.append(" "),this.visitNode(e.table),e.on&&(this.append(" "),this.visitNode(e.on));}visitOn(e){this.append("on "),this.visitNode(e.on);}visitRaw(e){const{sqlFragments:i,parameters:n}=e;for(let s=0;s<i.length;++s)this.append(i[s]),n.length>s&&this.visitNode(n[s]);}visitOperator(e){this.append(e.operator);}visitTable(e){this.visitNode(e.table);}visitSchemableIdentifier(e){e.schema&&(this.visitNode(e.schema),this.append(".")),this.visitNode(e.identifier);}visitCreateTable(e){this.append("create "),e.frontModifiers&&e.frontModifiers.length>0&&(this.compileList(e.frontModifiers," "),this.append(" ")),e.temporary&&this.append("temporary "),this.append("table "),e.ifNotExists&&this.append("if not exists "),this.visitNode(e.table),e.selectQuery?(this.append(" as "),this.visitNode(e.selectQuery)):(this.append(" ("),this.compileList([...e.columns,...e.constraints??[]]),this.append(")"),e.onCommit&&(this.append(" on commit "),this.append(e.onCommit)),e.endModifiers&&e.endModifiers.length>0&&(this.append(" "),this.compileList(e.endModifiers," ")));}visitColumnDefinition(e){e.ifNotExists&&this.append("if not exists "),this.visitNode(e.column),this.append(" "),this.visitNode(e.dataType),e.unsigned&&this.append(" unsigned"),e.frontModifiers&&e.frontModifiers.length>0&&(this.append(" "),this.compileList(e.frontModifiers," ")),e.generated&&(this.append(" "),this.visitNode(e.generated)),e.identity&&this.append(" identity"),e.defaultTo&&(this.append(" "),this.visitNode(e.defaultTo)),e.notNull&&this.append(" not null"),e.unique&&this.append(" unique"),e.nullsNotDistinct&&this.append(" nulls not distinct"),e.primaryKey&&this.append(" primary key"),e.autoIncrement&&(this.append(" "),this.append(this.getAutoIncrement())),e.references&&(this.append(" "),this.visitNode(e.references)),e.check&&(this.append(" "),this.visitNode(e.check)),e.endModifiers&&e.endModifiers.length>0&&(this.append(" "),this.compileList(e.endModifiers," "));}getAutoIncrement(){return "auto_increment"}visitReferences(e){this.append("references "),this.visitNode(e.table),this.append(" ("),this.compileList(e.columns),this.append(")"),e.onDelete&&(this.append(" on delete "),this.append(e.onDelete)),e.onUpdate&&(this.append(" on update "),this.append(e.onUpdate));}visitDropTable(e){this.append("drop table "),e.ifExists&&this.append("if exists "),this.visitNode(e.table),e.cascade&&this.append(" cascade");}visitDataType(e){this.append(e.dataType);}visitOrderBy(e){this.append("order by "),this.compileList(e.items);}visitOrderByItem(e){this.visitNode(e.orderBy),e.direction&&(this.append(" "),this.visitNode(e.direction));}visitGroupBy(e){this.append("group by "),this.compileList(e.items);}visitGroupByItem(e){this.visitNode(e.groupBy);}visitUpdateQuery(e){const i=this.nodeStack.find(a.is),n=i!==e;!n&&e.explain&&(this.visitNode(e.explain),this.append(" ")),n&&!S$2.is(i)&&this.append("("),e.with&&(this.visitNode(e.with),this.append(" ")),this.append("update "),e.top&&(this.visitNode(e.top),this.append(" ")),e.table&&(this.visitNode(e.table),this.append(" ")),this.append("set "),e.updates&&this.compileList(e.updates),e.output&&(this.append(" "),this.visitNode(e.output)),e.from&&(this.append(" "),this.visitNode(e.from)),e.joins&&(this.append(" "),this.compileList(e.joins," ")),e.where&&(this.append(" "),this.visitNode(e.where)),e.limit&&(this.append(" "),this.visitNode(e.limit)),e.returning&&(this.append(" "),this.visitNode(e.returning)),n&&!S$2.is(i)&&this.append(")");}visitColumnUpdate(e){this.visitNode(e.column),this.append(" = "),this.visitNode(e.value);}visitLimit(e){this.append("limit "),this.visitNode(e.limit);}visitOffset(e){this.append("offset "),this.visitNode(e.offset);}visitOnConflict(e){this.append("on conflict"),e.columns?(this.append(" ("),this.compileList(e.columns),this.append(")")):e.constraint?(this.append(" on constraint "),this.visitNode(e.constraint)):e.indexExpression&&(this.append(" ("),this.visitNode(e.indexExpression),this.append(")")),e.indexWhere&&(this.append(" "),this.visitNode(e.indexWhere)),e.doNothing===!0?this.append(" do nothing"):e.updates&&(this.append(" do update set "),this.compileList(e.updates),e.updateWhere&&(this.append(" "),this.visitNode(e.updateWhere)));}visitOnDuplicateKey(e){this.append("on duplicate key update "),this.compileList(e.updates);}visitCreateIndex(e){this.append("create "),e.unique&&this.append("unique "),this.append("index "),e.ifNotExists&&this.append("if not exists "),this.visitNode(e.name),e.table&&(this.append(" on "),this.visitNode(e.table)),e.using&&(this.append(" using "),this.visitNode(e.using)),e.columns&&(this.append(" ("),this.compileList(e.columns),this.append(")")),e.nullsNotDistinct&&this.append(" nulls not distinct"),e.where&&(this.append(" "),this.visitNode(e.where));}visitDropIndex(e){this.append("drop index "),e.ifExists&&this.append("if exists "),this.visitNode(e.name),e.table&&(this.append(" on "),this.visitNode(e.table)),e.cascade&&this.append(" cascade");}visitCreateSchema(e){this.append("create schema "),e.ifNotExists&&this.append("if not exists "),this.visitNode(e.schema);}visitDropSchema(e){this.append("drop schema "),e.ifExists&&this.append("if exists "),this.visitNode(e.schema),e.cascade&&this.append(" cascade");}visitPrimaryKeyConstraint(e){e.name&&(this.append("constraint "),this.visitNode(e.name),this.append(" ")),this.append("primary key ("),this.compileList(e.columns),this.append(")");}visitUniqueConstraint(e){e.name&&(this.append("constraint "),this.visitNode(e.name),this.append(" ")),this.append("unique"),e.nullsNotDistinct&&this.append(" nulls not distinct"),this.append(" ("),this.compileList(e.columns),this.append(")");}visitCheckConstraint(e){e.name&&(this.append("constraint "),this.visitNode(e.name),this.append(" ")),this.append("check ("),this.visitNode(e.expression),this.append(")");}visitForeignKeyConstraint(e){e.name&&(this.append("constraint "),this.visitNode(e.name),this.append(" ")),this.append("foreign key ("),this.compileList(e.columns),this.append(") "),this.visitNode(e.references),e.onDelete&&(this.append(" on delete "),this.append(e.onDelete)),e.onUpdate&&(this.append(" on update "),this.append(e.onUpdate));}visitList(e){this.compileList(e.items);}visitWith(e){this.append("with "),e.recursive&&this.append("recursive "),this.compileList(e.expressions);}visitCommonTableExpression(e){this.visitNode(e.name),this.append(" as "),Nt$1(e.materialized)&&(e.materialized||this.append("not "),this.append("materialized ")),this.visitNode(e.expression);}visitCommonTableExpressionName(e){this.visitNode(e.table),e.columns&&(this.append("("),this.compileList(e.columns),this.append(")"));}visitAlterTable(e){this.append("alter table "),this.visitNode(e.table),this.append(" "),e.renameTo&&(this.append("rename to "),this.visitNode(e.renameTo)),e.setSchema&&(this.append("set schema "),this.visitNode(e.setSchema)),e.addConstraint&&this.visitNode(e.addConstraint),e.dropConstraint&&this.visitNode(e.dropConstraint),e.columnAlterations&&this.compileColumnAlterations(e.columnAlterations),e.addIndex&&this.visitNode(e.addIndex),e.dropIndex&&this.visitNode(e.dropIndex);}visitAddColumn(e){this.append("add column "),this.visitNode(e.column);}visitRenameColumn(e){this.append("rename column "),this.visitNode(e.column),this.append(" to "),this.visitNode(e.renameTo);}visitDropColumn(e){this.append("drop column "),this.visitNode(e.column);}visitAlterColumn(e){this.append("alter column "),this.visitNode(e.column),this.append(" "),e.dataType&&(this.announcesNewColumnDataType()&&this.append("type "),this.visitNode(e.dataType),e.dataTypeExpression&&(this.append("using "),this.visitNode(e.dataTypeExpression))),e.setDefault&&(this.append("set default "),this.visitNode(e.setDefault)),e.dropDefault&&this.append("drop default"),e.setNotNull&&this.append("set not null"),e.dropNotNull&&this.append("drop not null");}visitModifyColumn(e){this.append("modify column "),this.visitNode(e.column);}visitAddConstraint(e){this.append("add "),this.visitNode(e.constraint);}visitDropConstraint(e){this.append("drop constraint "),e.ifExists&&this.append("if exists "),this.visitNode(e.constraintName),e.modifier==="cascade"?this.append(" cascade"):e.modifier==="restrict"&&this.append(" restrict");}visitSetOperation(e){this.append(e.operator),this.append(" "),e.all&&this.append("all "),this.visitNode(e.expression);}visitCreateView(e){this.append("create "),e.orReplace&&this.append("or replace "),e.materialized&&this.append("materialized "),e.temporary&&this.append("temporary "),this.append("view "),e.ifNotExists&&this.append("if not exists "),this.visitNode(e.name),this.append(" "),e.columns&&(this.append("("),this.compileList(e.columns),this.append(") ")),e.as&&(this.append("as "),this.visitNode(e.as));}visitDropView(e){this.append("drop "),e.materialized&&this.append("materialized "),this.append("view "),e.ifExists&&this.append("if exists "),this.visitNode(e.name),e.cascade&&this.append(" cascade");}visitGenerated(e){this.append("generated "),e.always&&this.append("always "),e.byDefault&&this.append("by default "),this.append("as "),e.identity&&this.append("identity"),e.expression&&(this.append("("),this.visitNode(e.expression),this.append(")")),e.stored&&this.append(" stored");}visitDefaultValue(e){this.append("default "),this.visitNode(e.defaultValue);}visitSelectModifier(e){e.rawModifier?this.visitNode(e.rawModifier):this.append(ds[e.modifier]),e.of&&(this.append(" of "),this.compileList(e.of,", "));}visitCreateType(e){this.append("create type "),this.visitNode(e.name),e.enum&&(this.append(" as enum "),this.visitNode(e.enum));}visitDropType(e){this.append("drop type "),e.ifExists&&this.append("if exists "),this.visitNode(e.name);}visitExplain(e){this.append("explain"),(e.options||e.format)&&(this.append(" "),this.append(this.getLeftExplainOptionsWrapper()),e.options&&(this.visitNode(e.options),e.format&&this.append(this.getExplainOptionsDelimiter())),e.format&&(this.append("format"),this.append(this.getExplainOptionAssignment()),this.append(e.format)),this.append(this.getRightExplainOptionsWrapper()));}visitDefaultInsertValue(e){this.append("default");}visitAggregateFunction(e){this.append(e.func),this.append("("),e.distinct&&this.append("distinct "),this.compileList(e.aggregated),this.append(")"),e.filter&&(this.append(" filter("),this.visitNode(e.filter),this.append(")")),e.over&&(this.append(" "),this.visitNode(e.over));}visitOver(e){this.append("over("),e.partitionBy&&(this.visitNode(e.partitionBy),e.orderBy&&this.append(" ")),e.orderBy&&this.visitNode(e.orderBy),this.append(")");}visitPartitionBy(e){this.append("partition by "),this.compileList(e.items);}visitPartitionByItem(e){this.visitNode(e.partitionBy);}visitBinaryOperation(e){this.visitNode(e.leftOperand),this.append(" "),this.visitNode(e.operator),this.append(" "),this.visitNode(e.rightOperand);}visitUnaryOperation(e){this.visitNode(e.operator),this.isMinusOperator(e.operator)||this.append(" "),this.visitNode(e.operand);}isMinusOperator(e){return ce.is(e)&&e.operator==="-"}visitUsing(e){this.append("using "),this.compileList(e.tables);}visitFunction(e){this.append(e.func),this.append("("),this.compileList(e.arguments),this.append(")");}visitCase(e){this.append("case"),e.value&&(this.append(" "),this.visitNode(e.value)),e.when&&(this.append(" "),this.compileList(e.when," ")),e.else&&(this.append(" else "),this.visitNode(e.else)),this.append(" end"),e.isStatement&&this.append(" case");}visitWhen(e){this.append("when "),this.visitNode(e.condition),e.result&&(this.append(" then "),this.visitNode(e.result));}visitJSONReference(e){this.visitNode(e.reference),this.visitNode(e.traversal);}visitJSONPath(e){e.inOperator&&this.visitNode(e.inOperator),this.append("'$");for(const i of e.pathLegs)this.visitNode(i);this.append("'");}visitJSONPathLeg(e){const i=e.type==="ArrayLocation";this.append(i?"[":"."),this.append(String(e.value)),i&&this.append("]");}visitJSONOperatorChain(e){for(let i=0,n=e.values.length;i<n;i++)i===n-1?this.visitNode(e.operator):this.append("->"),this.visitNode(e.values[i]);}visitMergeQuery(e){e.with&&(this.visitNode(e.with),this.append(" ")),this.append("merge "),e.top&&(this.visitNode(e.top),this.append(" ")),this.append("into "),this.visitNode(e.into),e.using&&(this.append(" "),this.visitNode(e.using)),e.whens&&(this.append(" "),this.compileList(e.whens," ")),e.output&&(this.append(" "),this.visitNode(e.output));}visitMatched(e){e.not&&this.append("not "),this.append("matched"),e.bySource&&this.append(" by source");}visitAddIndex(e){this.append("add "),e.unique&&this.append("unique "),this.append("index "),this.visitNode(e.name),e.columns&&(this.append(" ("),this.compileList(e.columns),this.append(")")),e.using&&(this.append(" using "),this.visitNode(e.using));}visitCast(e){this.append("cast("),this.visitNode(e.expression),this.append(" as "),this.visitNode(e.dataType),this.append(")");}visitFetch(e){this.append("fetch next "),this.visitNode(e.rowCount),this.append(` rows ${e.modifier}`);}visitOutput(e){this.append("output "),this.compileList(e.selections);}visitTop(e){this.append(`top(${e.expression})`),e.modifiers&&this.append(` ${e.modifiers}`);}append(e){this.#e+=e;}appendValue(e){this.addParameter(e),this.append(this.getCurrentParameterPlaceholder());}getLeftIdentifierWrapper(){return '"'}getRightIdentifierWrapper(){return '"'}getCurrentParameterPlaceholder(){return "$"+this.numParameters}getLeftExplainOptionsWrapper(){return "("}getExplainOptionAssignment(){return " "}getExplainOptionsDelimiter(){return ", "}getRightExplainOptionsWrapper(){return ")"}sanitizeIdentifier(e){const i=this.getLeftIdentifierWrapper(),n=this.getRightIdentifierWrapper();let s="";for(const o of e)s+=o,o===i?s+=i:o===n&&(s+=n);return s}addParameter(e){this.#t.push(e);}appendImmediateValue(e){if(E$2(e))this.append(`'${e}'`);else if(Ct$1(e)||Nt$1(e))this.append(e.toString());else if(Qt$1(e))this.append("null");else if(Lr(e))this.appendImmediateValue(e.toISOString());else if(Bt$1(e))this.appendImmediateValue(e.toString());else throw new Error(`invalid immediate value ${e}`)}sortSelectModifiers(e){return e.sort((i,n)=>i.modifier&&n.modifier?Ei[i.modifier]-Ei[n.modifier]:1),r(e)}compileColumnAlterations(e){this.compileList(e);}announcesNewColumnDataType(){return !0}}const ds=r({ForKeyShare:"for key share",ForNoKeyUpdate:"for no key update",ForUpdate:"for update",ForShare:"for share",NoWait:"nowait",SkipLocked:"skip locked",Distinct:"distinct"}),Ei=r({ForKeyShare:1,ForNoKeyUpdate:1,ForUpdate:1,ForShare:1,NoWait:2,SkipLocked:2,Distinct:0}),cs=r({InnerJoin:"inner join",LeftJoin:"left join",RightJoin:"right join",FullJoin:"full join",LateralInnerJoin:"inner join lateral",LateralLeftJoin:"left join lateral",Using:"using"}),ct$1=r({raw(t,e=[]){return r({sql:t,query:b$2.createWithSql(t),parameters:r(e)})}});class ls{get supportsCreateIfNotExists(){return !0}get supportsTransactionalDdl(){return !1}get supportsReturning(){return !1}get supportsOutput(){return !1}}const ps="kysely_migration",fs="kysely_migration_lock";r({__noMigrations__:!0});const ms=/"/g;class Ns extends us{sanitizeIdentifier(e){return e.replace(ms,'""')}}class ys{#e;constructor(e){this.#e=e;}async getSchemas(){return (await this.#e.selectFrom("pg_catalog.pg_namespace").select("nspname").$castTo().execute()).map(i=>({name:i.nspname}))}async getTables(e={withInternalKyselyTables:!1}){let i=this.#e.selectFrom("pg_catalog.pg_attribute as a").innerJoin("pg_catalog.pg_class as c","a.attrelid","c.oid").innerJoin("pg_catalog.pg_namespace as ns","c.relnamespace","ns.oid").innerJoin("pg_catalog.pg_type as typ","a.atttypid","typ.oid").innerJoin("pg_catalog.pg_namespace as dtns","typ.typnamespace","dtns.oid").select(["a.attname as column","a.attnotnull as not_null","a.atthasdef as has_default","c.relname as table","c.relkind as table_type","ns.nspname as schema","typ.typname as type","dtns.nspname as type_schema",Ae`col_description(a.attrelid, a.attnum)`.as("column_description"),this.#e.selectFrom("pg_class").select(Ae`true`.as("auto_incrementing")).whereRef("relnamespace","=","c.relnamespace").where("relkind","=","S").where("relname","=",Ae`c.relname || '_' || a.attname || '_seq'`).as("auto_incrementing")]).where(s=>s.or([s("c.relkind","=","r"),s("c.relkind","=","v"),s("c.relkind","=","p")])).where("ns.nspname","!~","^pg_").where("ns.nspname","!=","information_schema").where("a.attnum",">=",0).where("a.attisdropped","!=",!0).orderBy("ns.nspname").orderBy("c.relname").orderBy("a.attnum").$castTo();e.withInternalKyselyTables||(i=i.where("c.relname","!=",ps).where("c.relname","!=",fs));const n=await i.execute();return this.#t(n)}async getMetadata(e){return {tables:await this.getTables(e)}}#t(e){return e.reduce((i,n)=>{let s=i.find(o=>o.name===n.table&&o.schema===n.schema);return s||(s=r({name:n.table,isView:n.table_type==="v",schema:n.schema,columns:[]}),i.push(s)),s.columns.push(r({name:n.column,dataType:n.type,dataTypeSchema:n.type_schema,isNullable:!n.not_null,isAutoIncrementing:!!n.auto_incrementing,hasDefaultValue:n.has_default,comment:n.column_description??void 0})),i},[])}}const ws=BigInt("3853314791062309107");class gs extends ls{get supportsTransactionalDdl(){return !0}get supportsReturning(){return !0}async acquireMigrationLock(e,i){await Ae`select pg_advisory_xact_lock(${Ae.lit(ws)})`.execute(e);}async releaseMigrationLock(e,i){}}function xs(t,e){if(vs(t)&&e.stack){const i=e.stack.split(`
`).slice(1).join(`
`);return t.stack+=`
${i}`,t}return t}function vs(t){return $$2(t)&&E$2(t.stack)}const Nr=Symbol();class Os{#e;#t=new WeakMap;#i;constructor(e){this.#e=r({...e});}async init(){this.#i=A$1(this.#e.pool)?await this.#e.pool():this.#e.pool;}async acquireConnection(){const e=await this.#i.connect();let i=this.#t.get(e);return i||(i=new Ws(e,{cursor:this.#e.cursor??null}),this.#t.set(e,i),this.#e.onCreateConnection&&await this.#e.onCreateConnection(i)),i}async beginTransaction(e,i){i.isolationLevel?await e.executeQuery(ct$1.raw(`start transaction isolation level ${i.isolationLevel}`)):await e.executeQuery(ct$1.raw("begin"));}async commitTransaction(e){await e.executeQuery(ct$1.raw("commit"));}async rollbackTransaction(e){await e.executeQuery(ct$1.raw("rollback"));}async releaseConnection(e){e[Nr]();}async destroy(){if(this.#i){const e=this.#i;this.#i=void 0,await e.end();}}}class Ws{#e;#t;constructor(e,i){this.#e=e,this.#t=i;}async executeQuery(e){try{const i=await this.#e.query(e.sql,[...e.parameters]);if(i.command==="INSERT"||i.command==="UPDATE"||i.command==="DELETE"||i.command==="MERGE"){const n=BigInt(i.rowCount);return {numUpdatedOrDeletedRows:n,numAffectedRows:n,rows:i.rows??[]}}return {rows:i.rows??[]}}catch(i){throw xs(i,new Error)}}async*streamQuery(e,i){if(!this.#t.cursor)throw new Error("'cursor' is not present in your postgres dialect config. It's required to make streaming work in postgres.");if(!Number.isInteger(i)||i<=0)throw new Error("chunkSize must be a positive integer");const n=this.#e.query(new this.#t.cursor(e.sql,e.parameters.slice()));try{for(;;){const s=await n.read(i);if(s.length===0)break;yield {rows:s};}}finally{await n.close();}}[Nr](){this.#e.release();}}class bs{#e;constructor(e){this.#e=e;}createDriver(){return new Os(this.#e)}createQueryCompiler(){return new Ns}createAdapter(){return new gs}createIntrospector(e){return new ys(e)}}class qs{client;api;constructor(e){this.client=new se$1({dialect:new bs({pool:e})}),this.api=this.client;}}const Cs=new br$1.Pool({connectionString:Ar.DATABASE_URL}),ks=new qs(Cs);function Ts(t,e){const i=e;return n(i.url),Object.assign(async(n,s)=>i({method:t,payload:n||void 0,requestInit:s?.requestInit}),{url:e.url})}const Is=()=>Promise.resolve().then(()=>gr$1),Ss=()=>Promise.resolve().then(()=>gr$1),yr=createFileRoute("/")({component:lazyRouteComponent(Ss,"component",()=>yr.ssr),loader:lazyFn(Is,"loader")}),Es=Ts("POST",Er(wr)),As=function(){const e=useRouter(),i=yr.useLoaderData();return console.log(i),jsxs("div",{children:[jsx("button",{type:"button",onClick:()=>{Es("quan").then(()=>{e.invalidate();});},children:"Add user"}),i.data.map(n=>jsx("p",{children:n.username},n.id))]})},Ls=async()=>(await Sr.get("http://localhost:3000/api/users")).data;async function wr(t){await ks.api.insertInto("user").values({id:"123",username:t,email:t+"@mail.com"}).returningAll().executeTakeFirstOrThrow();}const gr$1=Object.freeze(Object.defineProperty({__proto__:null,$$function0:wr,component:As,loader:Ls},Symbol.toStringTag,{value:"Module"}));

const mod_0_4 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	$$function0: wr,
	component: As,
	loader: Ls
});

const chunks = {};
				chunks['c_7oungc.mjs'] = mod_0_4;
			
			 function app() {
				 globalThis.$$chunks = chunks;
			 }

const plugins = [
  plugin$2,
plugin$1,
plugin,
app
];

function defineNitroErrorHandler(handler) {
  return handler;
}
const errorHandler = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const { stack, statusCode, statusMessage, message } = normalizeError(error);
    const errorObject = {
      url: event.path || "",
      statusCode,
      statusMessage,
      message,
      stack: void 0
    };
    if (error.unhandled || error.fatal) {
      const tags = [
        "[nitro]",
        "[request error]",
        error.unhandled && "[unhandled]",
        error.fatal && "[fatal]"
      ].filter(Boolean).join(" ");
      console.error(
        tags,
        error.message + "\n" + stack.map((l) => "  " + l.text).join("  \n")
      );
    }
    setResponseStatus(event, statusCode, statusMessage);
    if (isJsonRequest(event)) {
      setResponseHeader(event, "Content-Type", "application/json");
      return send(event, JSON.stringify(errorObject));
    } else {
      setResponseHeader(event, "Content-Type", "text/html");
      return send(event, renderHTMLError(errorObject));
    }
  }
);
function renderHTMLError(error) {
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Request Error";
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${statusCode} ${statusMessage}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico/css/pico.min.css">
  </head>
  <body>
    <main class="container">
      <dialog open>
        <article>
          <header>
            <h2>${statusCode} ${statusMessage}</h2>
          </header>
          <code>
            ${error.message}<br><br>
            ${"\n" + (error.stack || []).map((i) => `&nbsp;&nbsp;${i}`).join("<br>")}
          </code>
          <footer>
            <a href="/" onclick="event.preventDefault();history.back();">Go Back</a>
          </footer>
        </article>
      </dialog>
    </main>
  </body>
</html>
`;
}

const assets = {
  "/_build/server-functions-manifest.json": {
    "type": "application/json",
    "etag": "\"64-nvUZ/BnhbZEgnbbNnS9kFAJ+un4\"",
    "mtime": "2024-10-27T07:18:24.602Z",
    "size": 100,
    "path": "../public/_build/server-functions-manifest.json"
  },
  "/_build/.vite/manifest.json": {
    "type": "application/json",
    "etag": "\"28f-HQeZHwy8tIA+3nlOdB4CX+Ig3rI\"",
    "mtime": "2024-10-27T07:18:24.602Z",
    "size": 655,
    "path": "../public/_build/.vite/manifest.json"
  },
  "/_build/assets/client-BBEbIahw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"32e57-IfEPl7Ag5NtqVjHiowiWogidATE\"",
    "mtime": "2024-10-27T07:18:24.602Z",
    "size": 208471,
    "path": "../public/_build/assets/client-BBEbIahw.js"
  },
  "/_build/assets/client-DRwj4wGm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3f-tUGmPY4FpPhbgJL3PorQxjqAgpI\"",
    "mtime": "2024-10-27T07:18:24.602Z",
    "size": 63,
    "path": "../public/_build/assets/client-DRwj4wGm.js"
  },
  "/_build/assets/index-JL9gITWW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9237-beRGbpVsbKjaf3yb9y5/9GHx9bU\"",
    "mtime": "2024-10-27T07:18:24.602Z",
    "size": 37431,
    "path": "../public/_build/assets/index-JL9gITWW.js"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _f4b49z = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    setResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

function U$2(e={}){let t,n=!1;const a=r=>{if(t&&t!==r)throw new Error("Context conflict")};let o;if(e.asyncContext){const r=e.AsyncLocalStorage||globalThis.AsyncLocalStorage;r?o=new r:console.warn("[unctx] `AsyncLocalStorage` is not provided.");}const u=()=>{if(o&&t===void 0){const r=o.getStore();if(r!==void 0)return r}return t};return {use:()=>{const r=u();if(r===void 0)throw new Error("Context is not available");return r},tryUse:()=>u(),set:(r,s)=>{s||a(r),t=r,n=!0;},unset:()=>{t=void 0,n=!1;},call:(r,s)=>{a(r),t=r;try{return o?o.run(r,s):s()}finally{n||(t=void 0);}},async callAsync(r,s){t=r;const f=()=>{t=r;},d=()=>t===r?f:void 0;T$2.add(d);try{const l=o?o.run(r,s):s();return n||(t=void 0),await l}finally{T$2.delete(d);}}}}function W$2(e={}){const t={};return {get(n,a={}){return t[n]||(t[n]=U$2({...e,...a})),t[n],t[n]}}}const p$1=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof global<"u"?global:{},R$2="__unctx__",q$2=p$1[R$2]||(p$1[R$2]=W$2()),J$1=(e,t={})=>q$2.get(e,t),b$1="__unctx_async_handlers__",T$2=p$1[b$1]||(p$1[b$1]=new Set);function $$1(e){let t;const n=E$1(e),a={duplex:"half",method:e.method,headers:e.headers};return e.node.req.body instanceof ArrayBuffer?new Request(n,{...a,body:e.node.req.body}):new Request(n,{...a,get body(){return t||(t=z$1(e),t)}})}function M$2(e){return e.web??={request:$$1(e),url:E$1(e)},e.web.request}function D$2(){return L$1()}const C$2=Symbol("$HTTPEvent");function K$1(e){return typeof e=="object"&&(e instanceof H3Event||e?.[C$2]instanceof H3Event||e?.__is_event__===!0)}function w$1(e){return function(...t){let n=t[0];if(K$1(n))t[0]=n instanceof H3Event||n.__is_event__?n:n[C$2];else {if(!globalThis.app.config.server.experimental?.asyncContext)throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");if(n=D$2(),!n)throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");t.unshift(n);}return e(...t)}}const E$1=w$1(getRequestURL),B$1=w$1(getResponseStatus),z$1=w$1(getRequestWebStream);function G$1(){return J$1("nitro-app",{asyncContext:!!globalThis.app.config.server.experimental?.asyncContext,AsyncLocalStorage:AsyncLocalStorage})}function L$1(){return G$1().use().event}function Q$1(e){return globalThis.MANIFEST[e]}const v$1="server-fn-return-type",g$2="server-fn-payload-type",ne$1=eventHandler(V);async function V(e){return X$1(M$2(e))}async function X$1(e,t){var n$1,a;const o=e.method,u=new URL(e.url,"http://localhost:3000"),r=Object.fromEntries(new URLSearchParams(u.search).entries()),s=r._serverFnId,f=r._serverFnName;if(!s||!f)throw new Error("Invalid request");n(typeof s=="string");const d=(a=await((n$1=Q$1("server").chunks[s])==null?void 0:n$1.import()))==null?void 0:a[f],l=await(async()=>{try{const i=await(async()=>{var m;return e.headers.get(g$2)==="payload"?[o.toLowerCase()==="get"?(()=>{var y;return (y=defaultParseSearch(u.search))==null?void 0:y.payload})():await e.json(),{method:o,request:e}]:e.headers.get(g$2)==="formData"||(m=e.headers.get("Content-Type"))!=null&&m.includes("multipart/form-data")?[o.toLowerCase()==="get"?(()=>{const{_serverFnId:y,_serverFnName:Y,payload:N}=r;return N})():await e.formData(),{method:o,request:e}]:e.headers.get(g$2)==="request"?[e,{method:o,request:e}]:await e.json()})(),c=await d(...i);return c instanceof Response?c:isRedirect$1(c)||isNotFound(c)?x(c):new Response(c!==void 0?JSON.stringify(c):void 0,{status:B$1(L$1()),headers:{"Content-Type":"application/json",[v$1]:"json"}})}catch(i){return i instanceof Response?i:isRedirect$1(i)||isNotFound(i)?x(i):(console.error("Server Fn Error!"),console.error(i),console.info(),new Response(JSON.stringify(i),{status:500,headers:{"Content-Type":"application/json",[v$1]:"error"}}))}})();if(l.headers.get("Content-Type")==="application/json"){const c=await l.clone().text();c&&JSON.stringify(JSON.parse(c));}return l}function x(e){const{headers:t,...n}=e;return new Response(JSON.stringify(n),{status:200,headers:{"Content-Type":"application/json",[v$1]:"json",...e.headers||{}}})}

function S$1(e = {}) {
  let t, n = false;
  const i = (o) => {
    if (t && t !== o)
      throw new Error("Context conflict");
  };
  let r;
  if (e.asyncContext) {
    const o = e.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    o ? r = new o() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const s = () => {
    if (r && t === void 0) {
      const o = r.getStore();
      if (o !== void 0)
        return o;
    }
    return t;
  };
  return { use: () => {
    const o = s();
    if (o === void 0)
      throw new Error("Context is not available");
    return o;
  }, tryUse: () => s(), set: (o, a) => {
    a || i(o), t = o, n = true;
  }, unset: () => {
    t = void 0, n = false;
  }, call: (o, a) => {
    i(o), t = o;
    try {
      return r ? r.run(o, a) : a();
    } finally {
      n || (t = void 0);
    }
  }, async callAsync(o, a) {
    t = o;
    const u = () => {
      t = o;
    }, l = () => t === o ? u : void 0;
    g$1.add(l);
    try {
      const f = r ? r.run(o, a) : a();
      return n || (t = void 0), await f;
    } finally {
      g$1.delete(l);
    }
  } };
}
function T$1(e = {}) {
  const t = {};
  return { get(n, i = {}) {
    return t[n] || (t[n] = S$1({ ...e, ...i })), t[n], t[n];
  } };
}
const p = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, h = "__unctx__", A = p[h] || (p[h] = T$1()), E = (e, t = {}) => A.get(e, t), m = "__unctx_async_handlers__", g$1 = p[m] || (p[m] = /* @__PURE__ */ new Set());
function H(e) {
  let t;
  const n = b(e), i = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(n, { ...i, body: e.node.req.body }) : new Request(n, { ...i, get body() {
    return t || (t = I(e), t);
  } });
}
function C$1(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: H(e), url: b(e) }, e.web.request;
}
function L() {
  return U$1();
}
const w = Symbol("$HTTPEvent");
function q$1(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[w]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function R$1(e) {
  return function(...t) {
    var _a;
    let n = t[0];
    if (q$1(n))
      t[0] = n instanceof H3Event || n.__is_event__ ? n : n[w];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext))
        throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (n = L(), !n)
        throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(n);
    }
    return e(...t);
  };
}
const b = R$1(getRequestURL), I = R$1(getRequestWebStream);
function $() {
  var _a;
  return E("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function U$1() {
  return $().use().event;
}
const W$1 = [{ path: "/__root", filePath: "/Users/phammikun/Development/tssd/apps/web/app/routes/__root.tsx" }, { path: "/", filePath: "/Users/phammikun/Development/tssd/apps/web/app/routes/index.tsx" }, { path: "/api/users", filePath: "/Users/phammikun/Development/tssd/apps/web/app/routes/api/users.ts", $APIRoute: { src: "app/routes/api/users.ts?pick=Route", build: () => import('./build/users.mjs'), import: () => import('./build/users.mjs') } }], B = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];
function M$1(e) {
  return eventHandler(async (t) => {
    const n = C$1(t);
    return await e({ request: n });
  });
}
const k$1 = (e) => (t) => ({ path: e, methods: t });
function N(e, t) {
  const n = e.pathname.split("/").filter(Boolean), i = t.sort((r, s) => {
    const o = r.routePath.split("/").filter(Boolean);
    return s.routePath.split("/").filter(Boolean).length - o.length;
  }).filter((r) => {
    const s = r.routePath.split("/").filter(Boolean);
    return n.length >= s.length;
  });
  for (const r of i) {
    const s = r.routePath.split("/").filter(Boolean), o = {};
    let a = true;
    for (let u = 0; u < s.length; u++) {
      const l = s[u], f = n[u];
      if (l.startsWith("$"))
        if (l === "$") {
          const c = n.slice(u).join("/");
          if (c !== "")
            o["*"] = c, o._splat = c;
          else {
            a = false;
            break;
          }
        } else {
          const c = l.slice(1);
          o[c] = f;
        }
      else if (l !== f) {
        a = false;
        break;
      }
    }
    if (a)
      return { routePath: r.routePath, params: o, payload: r.payload };
  }
}
const y = W$1.filter((e) => e.$APIRoute);
function D$1(e) {
  const t = [];
  return e.forEach((n) => {
    const r = n.path.split("/").filter(Boolean).map((s) => s === "*splat" ? "$" : s.startsWith(":$") && s.endsWith("?") ? s.slice(1, -1) : s).join("/");
    t.push({ routePath: `/${r}`, payload: n });
  }), t;
}
const K = async ({ request: e }) => {
  if (!y.length)
    return new Response("No routes found", { status: 404 });
  if (!B.includes(e.method))
    return new Response("Method not allowed", { status: 405 });
  const t = D$1(y), n = new URL(e.url, "http://localhost:3000"), i = N(n, t);
  if (!i)
    return new Response("Not found", { status: 404 });
  let r;
  try {
    r = await i.payload.$APIRoute.import().then((a) => a.Route);
  } catch (a) {
    return console.error("Error importing route file:", a), new Response("Internal server error", { status: 500 });
  }
  if (!r)
    return new Response("Internal server error", { status: 500 });
  const s = e.method, o = r.methods[s];
  return o ? await o({ request: e, params: i.params }) : new Response("Method not allowed", { status: 405 });
};

const d = M$1(K);

const Ie = () => ({ routes: { __root__: { filePath: "__root.tsx", children: ["/"], preloads: ["/_build/assets/client-DRwj4wGm.js", "/_build/assets/client-BBEbIahw.js"] }, "/": { filePath: "index.tsx" } } });
function Ne(e) {
  return globalThis.MANIFEST[e];
}
function Be() {
  var _a;
  const e = Ie(), t = e.routes.__root__ = e.routes.__root__ || {};
  t.assets = t.assets || [];
  const r = Ne("client");
  return t.assets.push({ tag: "script", attrs: { src: (_a = r.inputs[r.handler]) == null ? void 0 : _a.output.path, type: "module", async: true, suppressHydrationWarning: true } }), e;
}
function ze() {
  const e = Be();
  return { ...e, routes: Object.fromEntries(Object.entries(e.routes).map(([t, r]) => {
    const { preloads: n, assets: o } = r;
    return [t, { preloads: n, assets: o }];
  })) };
}
class S {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  static create() {
    return S.instance || (S.instance = new S()), S.instance;
  }
  createContext(t, r) {
    const n = createContext$1(r);
    return this.cache.set(t, n), n;
  }
  get(t, r) {
    return this.cache.get(t) || this.createContext(t, r);
  }
}
const Oe = S.create(), Z = Oe;
function We(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
const Q = {}, Ue = Q.hasOwnProperty, X = (e, t) => {
  for (const r in e)
    Ue.call(e, r) && t(r, e[r]);
}, Je = (e, t) => (t && X(t, (r, n) => {
  e[r] = n;
}), e), Ge = (e, t) => {
  const r = e.length;
  let n = -1;
  for (; ++n < r; )
    t(e[n]);
}, M = (e) => "\\u" + ("0000" + e).slice(-4), v = (e, t) => {
  let r = e.toString(16);
  return t ? r : r.toUpperCase();
}, C = Q.toString, Ke = Array.isArray, Ve = (e) => typeof Buffer == "function" && Buffer.isBuffer(e), Ze = (e) => C.call(e) == "[object Object]", Qe = (e) => typeof e == "string" || C.call(e) == "[object String]", Xe = (e) => typeof e == "number" || C.call(e) == "[object Number]", Ye = (e) => typeof e == "function", et = (e) => C.call(e) == "[object Map]", tt = (e) => C.call(e) == "[object Set]", rt = { "\\": "\\\\", "\b": "\\b", "\f": "\\f", "\n": "\\n", "\r": "\\r", "	": "\\t" }, nt = /[\\\b\f\n\r\t]/, st = /[0-9]/, ot = /[\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/, at = /([\uD800-\uDBFF][\uDC00-\uDFFF])|([\uD800-\uDFFF])|(['"`])|[^]/g, ct = /([\uD800-\uDBFF][\uDC00-\uDFFF])|([\uD800-\uDFFF])|(['"`])|[^ !#-&\(-\[\]-_a-~]/g, g = (e, t) => {
  const r = () => {
    l = u, ++t.indentLevel, u = t.indent.repeat(t.indentLevel);
  }, n = { escapeEverything: false, minimal: false, isScriptContext: false, quotes: "single", wrap: false, es6: false, json: false, compact: true, lowercaseHex: false, numbers: "decimal", indent: "	", indentLevel: 0, __inline1__: false, __inline2__: false }, o = t && t.json;
  o && (n.quotes = "double", n.wrap = true), t = Je(n, t), t.quotes != "single" && t.quotes != "double" && t.quotes != "backtick" && (t.quotes = "single");
  const a = t.quotes == "double" ? '"' : t.quotes == "backtick" ? "`" : "'", s = t.compact, c = t.lowercaseHex;
  let u = t.indent.repeat(t.indentLevel), l = "";
  const d = t.__inline1__, p = t.__inline2__, m = s ? "" : `
`;
  let f, $ = true;
  const ae = t.numbers == "binary", ce = t.numbers == "octal", ie = t.numbers == "decimal", ue = t.numbers == "hexadecimal";
  if (o && e && Ye(e.toJSON) && (e = e.toJSON()), !Qe(e)) {
    if (et(e))
      return e.size == 0 ? "new Map()" : (s || (t.__inline1__ = true, t.__inline2__ = false), "new Map(" + g(Array.from(e), t) + ")");
    if (tt(e))
      return e.size == 0 ? "new Set()" : "new Set(" + g(Array.from(e), t) + ")";
    if (Ve(e))
      return e.length == 0 ? "Buffer.from([])" : "Buffer.from(" + g(Array.from(e), t) + ")";
    if (Ke(e))
      return f = [], t.wrap = true, d && (t.__inline1__ = false, t.__inline2__ = true), p || r(), Ge(e, (h) => {
        $ = false, p && (t.__inline2__ = false), f.push((s || p ? "" : u) + g(h, t));
      }), $ ? "[]" : p ? "[" + f.join(", ") + "]" : "[" + m + f.join("," + m) + m + (s ? "" : l) + "]";
    if (Xe(e)) {
      if (o)
        return JSON.stringify(e);
      if (ie)
        return String(e);
      if (ue) {
        let h = e.toString(16);
        return c || (h = h.toUpperCase()), "0x" + h;
      }
      if (ae)
        return "0b" + e.toString(2);
      if (ce)
        return "0o" + e.toString(8);
    } else
      return Ze(e) ? (f = [], t.wrap = true, r(), X(e, (h, w) => {
        $ = false, f.push((s ? "" : u) + g(h, t) + ":" + (s ? "" : " ") + g(w, t));
      }), $ ? "{}" : "{" + m + f.join("," + m) + m + (s ? "" : l) + "}") : o ? JSON.stringify(e) || "null" : String(e);
  }
  const le = t.escapeEverything ? at : ct;
  return f = e.replace(le, (h, w, I, j, de, fe) => {
    if (w) {
      if (t.minimal)
        return w;
      const N = w.charCodeAt(0), B = w.charCodeAt(1);
      if (t.es6) {
        const me = (N - 55296) * 1024 + B - 56320 + 65536;
        return "\\u{" + v(me, c) + "}";
      }
      return M(v(N, c)) + M(v(B, c));
    }
    if (I)
      return M(v(I.charCodeAt(0), c));
    if (h == "\0" && !o && !st.test(fe.charAt(de + 1)))
      return "\\0";
    if (j)
      return j == a || t.escapeEverything ? "\\" + j : j;
    if (nt.test(h))
      return rt[h];
    if (t.minimal && !ot.test(h))
      return h;
    const F = v(h.charCodeAt(0), c);
    return o || F.length > 2 ? M(F) : "\\x" + ("00" + F).slice(-2);
  }), a == "`" && (f = f.replace(/\$\{/g, "\\${")), t.isScriptContext && (f = f.replace(/<\/(script|style)/gi, "<\\/$1").replace(/<!--/g, o ? "\\u003C!--" : "\\x3C!--")), t.wrap && (f = a + f + a), f;
};
g.version = "3.0.2";
var it = g;
const k = We(it);
var ut = "Invariant failed";
function lt(e, t) {
  if (!e)
    throw new Error(ut);
}
function dt(e, t, r) {
  if (!r.router.isServer)
    return t;
  r.match.extracted = r.match.extracted || [];
  const n = r.match.extracted;
  return P(t, (a, s) => {
    const c = a instanceof ReadableStream ? "stream" : a instanceof Promise ? "promise" : void 0;
    if (c) {
      const u = { dataType: e, type: c, path: s, id: n.length, value: a, matchIndex: r.match.index };
      if (n.push(u), c === "stream") {
        const [l, d] = a.tee();
        return u.streamState = yt({ stream: d }), l;
      } else
        defer$1(a);
    }
    return a;
  });
}
function ft(e) {
  const t = useRouter(), r = t.state.matches[e.matchIndex];
  if (!t.isServer)
    return null;
  const n = r.extracted, [o, a] = ["__beforeLoadContext", "loaderData"].map((s) => n ? n.reduce((c, u) => u.dataType !== s ? q(c, ["temp", ...u.path], void 0) : c, { temp: r[s] }).temp : r[s]);
  return jsxs(Fragment, { children: [o !== void 0 || a !== void 0 || (n == null ? void 0 : n.length) ? jsx(ScriptOnce, { children: `__TSR__.matches[${e.matchIndex}] = ${k({ __beforeLoadContext: t.options.transformer.stringify(o), loaderData: t.options.transformer.stringify(a), extracted: n ? Object.fromEntries(n.map((s) => [s.id, pick(s, ["type", "path"])])) : {} }, { isScriptContext: true, wrap: true, json: true })}; __TSR__.initMatch(${e.matchIndex})` }) : null, n ? n.map((s, c) => s.type === "stream" ? jsx(pt, { entry: s }, s.id) : jsx(mt, { entry: s }, s.id)) : null] });
}
function P(e, t, r = []) {
  if (isPlainArray(e))
    return e.map((o, a) => P(o, t, [...r, `${a}`]));
  if (isPlainObject$1(e)) {
    const o = {};
    for (const a in e)
      o[a] = P(e[a], t, [...r, a]);
    return o;
  }
  const n = t(e, r);
  return n !== e ? n : e;
}
function mt({ entry: e }) {
  return jsx("div", { className: "tsr-once", children: jsx(x$2.Suspense, { fallback: null, children: jsx(ht, { entry: e }) }) });
}
function ht({ entry: e }) {
  if (e.value.status === "pending")
    throw e.value;
  return jsx(ScriptOnce, { children: `__TSR__.matches[${e.matchIndex}].extracted[${e.id}].resolve(${k(e.value.data, { isScriptContext: true, wrap: true, json: true })})` });
}
function pt({ entry: e }) {
  return lt(e.streamState), jsx(Y, { streamState: e.streamState, children: (t) => jsx(ScriptOnce, { children: t ? `__TSR__.matches[${e.matchIndex}].extracted[${e.id}].value.controller.enqueue(new TextEncoder().encode(${k(t.toString(), { isScriptContext: true, wrap: true, json: true })}))` : `__TSR__.matches[${e.matchIndex}].extracted[${e.id}].value.controller.close()` }) });
}
function yt({ stream: e }) {
  const t = { promises: [] }, r = e.getReader(), n = (o) => (t.promises[o] = createControlledPromise(), r.read().then(({ done: a, value: s }) => {
    if (a) {
      t.promises[o].resolve(null), r.releaseLock();
      return;
    }
    return t.promises[o].resolve(s), n(o + 1);
  }));
  return n(0).catch((o) => {
    console.error("stream read error", o);
  }), t;
}
function Y({ streamState: e, children: t, __index: r = 0 }) {
  const n = e.promises[r];
  if (!n)
    return null;
  if (n.status === "pending")
    throw n;
  const o = n.value;
  return jsxs(Fragment, { children: [t(o), jsx("div", { className: "tsr-once", children: jsx(x$2.Suspense, { fallback: null, children: jsx(Y, { streamState: e, __index: r + 1, children: t }) }) })] });
}
function q(e, t, r) {
  if (t.length === 0)
    return r;
  const [n, ...o] = t;
  return Array.isArray(e) ? e.map((a, s) => s === Number(n) ? q(a, o, r) : a) : isPlainObject$1(e) ? { ...e, [n]: q(e[n], o, r) } : e;
}
function z(e) {
  e.router.AfterEachMatch = ft, e.router.serializer = (n) => k(n, { isScriptContext: true, wrap: true, json: true });
  const t = Z.get("TanStackRouterHydrationContext", {}), r = x$2.useMemo(() => {
    var n, o;
    return { router: e.router.dehydrate(), payload: (o = (n = e.router.options).dehydrate) == null ? void 0 : o.call(n) };
  }, [e.router]);
  return jsx(t.Provider, { value: r, children: jsx(RouterProvider, { router: e.router }) });
}
function gt(e = {}) {
  let t, r = false;
  const n = (s) => {
    if (t && t !== s)
      throw new Error("Context conflict");
  };
  let o;
  if (e.asyncContext) {
    const s = e.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    s ? o = new s() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const a = () => {
    if (o && t === void 0) {
      const s = o.getStore();
      if (s !== void 0)
        return s;
    }
    return t;
  };
  return { use: () => {
    const s = a();
    if (s === void 0)
      throw new Error("Context is not available");
    return s;
  }, tryUse: () => a(), set: (s, c) => {
    c || n(s), t = s, r = true;
  }, unset: () => {
    t = void 0, r = false;
  }, call: (s, c) => {
    n(s), t = s;
    try {
      return o ? o.run(s, c) : c();
    } finally {
      r || (t = void 0);
    }
  }, async callAsync(s, c) {
    t = s;
    const u = () => {
      t = s;
    }, l = () => t === s ? u : void 0;
    U.add(l);
    try {
      const d = o ? o.run(s, c) : c();
      return r || (t = void 0), await d;
    } finally {
      U.delete(l);
    }
  } };
}
function _t(e = {}) {
  const t = {};
  return { get(r, n = {}) {
    return t[r] || (t[r] = gt({ ...e, ...n })), t[r], t[r];
  } };
}
const D = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, O = "__unctx__", bt = D[O] || (D[O] = _t()), xt = (e, t = {}) => bt.get(e, t), W = "__unctx_async_handlers__", U = D[W] || (D[W] = /* @__PURE__ */ new Set());
function wt(e) {
  let t;
  const r = te(e), n = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(r, { ...n, body: e.node.req.body }) : new Request(r, { ...n, get body() {
    return t || (t = Ht(e), t);
  } });
}
function St(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: wt(e), url: te(e) }, e.web.request;
}
function vt() {
  return kt();
}
const ee = Symbol("$HTTPEvent");
function Rt(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[ee]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function T(e) {
  return function(...t) {
    var _a;
    let r = t[0];
    if (Rt(r))
      t[0] = r instanceof H3Event || r.__is_event__ ? r : r[ee];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext))
        throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (r = vt(), !r)
        throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(r);
    }
    return e(...t);
  };
}
const gr = T(getRequestHeaders), te = T(getRequestURL), _r = T(getResponseStatus), Et = T(getResponseHeaders), Ht = T(getRequestWebStream);
function Ct() {
  var _a;
  return xt("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function kt() {
  return Ct().use().event;
}
function Tt(e) {
  return e instanceof Headers ? new Headers(e) : Array.isArray(e) ? new Headers(e) : typeof e == "object" ? new Headers(e) : new Headers();
}
function J(...e) {
  return e.reduce((t, r) => {
    const n = Tt(r);
    for (const [o, a] of n.entries())
      t.set(o, a);
    return t;
  }, new Headers());
}
const $t = "server-fn-return-type", jt = "server-fn-payload-type";
function At({ createRouter: e, getRouterManifest: t }) {
  return (r) => eventHandler(async (n) => {
    const o = St(n), a = new URL(o.url), s = a.href.replace(a.origin, ""), c = createMemoryHistory({ initialEntries: [s] }), u = e();
    u.serializeLoaderData = dt, t && (u.manifest = t()), u.update({ history: c }), await u.load();
    const l = Mt({ event: n, router: u });
    return await r({ request: o, router: u, responseHeaders: l });
  });
}
function Mt(e) {
  e.event.__tsrHeadersSent = true;
  let t = J(Et(e.event), { "Content-Type": "text/html; charset=UTF-8" }, ...e.router.state.matches.map((n) => n.headers));
  const { redirect: r } = e.router.state;
  return r && (t = J(t, r.headers, { Location: r.href })), [$t, jt].forEach((n) => {
    t.delete(n);
  }), t;
}
var Dt = " daum[ /]| deusu/| yadirectfetcher|(?:^|[^g])news(?!sapphire)|(?<! (?:channel/|google/))google(?!(app|/google| pixel))|(?<! cu)bots?(?:\\b|_)|(?<!(?:lib))http|(?<![hg]m)score|@[a-z][\\w-]+\\.|\\(\\)|\\.com\\b|\\btime/|^<|^[\\w \\.\\-\\(?:\\):]+(?:/v?\\d+(?:\\.\\d+)?(?:\\.\\d{1,10})*?)?(?:,|$)|^[^ ]{50,}$|^\\d+\\b|^\\w*search\\b|^\\w+/[\\w\\(\\)]*$|^active|^ad muncher|^amaya|^avsdevicesdk/|^biglotron|^bot|^bw/|^clamav[ /]|^client/|^cobweb/|^custom|^ddg[_-]android|^discourse|^dispatch/\\d|^downcast/|^duckduckgo|^facebook|^getright/|^gozilla/|^hobbit|^hotzonu|^hwcdn/|^jeode/|^jetty/|^jigsaw|^microsoft bits|^movabletype|^mozilla/5\\.0\\s[a-z\\.-]+$|^mozilla/\\d\\.\\d \\(compatible;?\\)$|^mozilla/\\d\\.\\d \\w*$|^navermailapp|^netsurf|^offline|^owler|^php|^postman|^python|^rank|^read|^reed|^rest|^rss|^snapchat|^space bison|^svn|^swcd |^taringa|^thumbor/|^track|^valid|^w3c|^webbandit/|^webcopier|^wget|^whatsapp|^wordpress|^xenu link sleuth|^yahoo|^yandex|^zdm/\\d|^zoom marketplace/|^{{.*}}$|adscanner/|analyzer|archive|ask jeeves/teoma|bit\\.ly/|bluecoat drtr|browsex|burpcollaborator|capture|catch|check\\b|checker|chrome-lighthouse|chromeframe|classifier|cloudflare|convertify|crawl|cypress/|dareboost|datanyze|dejaclick|detect|dmbrowser|download|evc-batch/|exaleadcloudview|feed|firephp|functionize|gomezagent|headless|httrack|hubspot marketing grader|hydra|ibisbrowser|images|infrawatch|insight|inspect|iplabel|ips-agent|java(?!;)|jsjcw_scanner|library|linkcheck|mail\\.ru/|manager|measure|neustar wpm|node|nutch|offbyone|optimize|pageburst|pagespeed|parser|perl|phantomjs|pingdom|powermarks|preview|proxy|ptst[ /]\\d|reputation|resolver|retriever|rexx;|rigor|rss\\b|scanner\\.|scrape|server|sogou|sparkler/|speedcurve|spider|splash|statuscake|supercleaner|synapse|synthetic|tools|torrent|trace|transcoder|url|virtuoso|wappalyzer|webglance|webkit2png|whatcms/|zgrab", Ft = /bot|crawl|http|lighthouse|scan|search|spider/i, R;
function Lt() {
  if (R instanceof RegExp)
    return R;
  try {
    R = new RegExp(Dt, "i");
  } catch {
    R = Ft;
  }
  return R;
}
function G(e) {
  return !!e && Lt().test(e);
}
function Pt(e) {
  const t = re(() => e.injectedHtml.map((r) => r()).join(""));
  return new Transform({ transform(r, n, o) {
    t.transform(r, this.push.bind(this)).then(() => o()).catch((a) => o(a));
  }, flush(r) {
    t.flush(this.push.bind(this)).then(() => r()).catch((n) => r(n));
  } });
}
function qt(e) {
  const t = re(() => e.injectedHtml.map((n) => n()).join("")), r = new TextEncoder();
  return new TransformStream({ transform(n, o) {
    return t.transform(n, (a) => (o.enqueue(r.encode(a)), true));
  }, flush(n) {
    return t.flush((o) => (n.enqueue(o), true));
  } });
}
const It = /(<body)/, Nt = /(<\/body>)/, Bt = /(<\/html>)/, zt = /(<\/[a-zA-Z][\w:.-]*?>)/g, Ot = new TextDecoder();
function re(e) {
  let t = false, r = "", n = "";
  return { async transform(o, a) {
    const s = r + Ot.decode(o), c = s.match(It), u = s.match(Nt), l = s.match(Bt);
    try {
      if (c && (t = true), !t) {
        a(s), r = "";
        return;
      }
      const d = e();
      if (u && l && u.index < l.index) {
        const p = u.index + u[0].length, m = l.index + l[0].length, f = s.slice(0, p) + d + s.slice(p, m) + s.slice(m);
        a(f), r = "";
      } else {
        let p, m = 0;
        for (; (p = zt.exec(s)) !== null; )
          m = p.index + p[0].length;
        if (m > 0) {
          const f = s.slice(0, m) + d + n;
          a(f), r = s.slice(m);
        } else
          r = s, n += d;
      }
    } catch (d) {
      throw console.error(d), d;
    }
  }, async flush(o) {
    r && o(r);
  } };
}
const Wt = async ({ request: e, router: t, responseHeaders: r }) => {
  if (typeof A$2.renderToReadableStream == "function") {
    const n = await A$2.renderToReadableStream(jsx(z, { router: t }), { signal: e.signal, onError(s, c) {
      console.error(s, c);
    } });
    G(e.headers.get("User-Agent")) && await n.allReady;
    const a = [qt(t)].reduce((s, c) => s.pipeThrough(c), n);
    return new Response(a, { status: t.state.statusCode, headers: r });
  }
  if (typeof A$2.renderToPipeableStream == "function") {
    const n = new PassThrough(), o = A$2.renderToPipeableStream(jsx(z, { router: t }), { ...G(e.headers.get("User-Agent")) ? { onAllReady() {
      o.pipe(n);
    } } : { onShellReady() {
      o.pipe(n);
    } }, onShellError(c) {
      throw c;
    } }), s = [Pt(t)].reduce((c, u) => c.pipe(u), n);
    return new Response(s, { status: t.state.statusCode, headers: r });
  }
  throw new Error("No renderToReadableStream or renderToPipeableStream found in react-dom/server. Ensure you are using a version of react-dom that supports streaming.");
};
function Ut({ children: e }) {
  return jsxs("div", { className: "space-y-2 p-2", children: [jsx("div", { className: "text-gray-600 dark:text-gray-400", children: e || jsx("p", { children: "The page you are looking for does not exist." }) }), jsxs("p", { className: "flex items-center gap-2 flex-wrap", children: [jsx("button", { onClick: () => window.history.back(), className: "bg-emerald-500 text-white px-2 py-1 rounded uppercase font-black text-sm", children: "Go back" }), jsx(Link, { to: "/", className: "bg-cyan-600 text-white px-2 py-1 rounded uppercase font-black text-sm", children: "Start Over" })] })] });
}
function ne({ tag: e, attrs: t, children: r }) {
  switch (e) {
    case "title":
      return jsx("title", { ...t, suppressHydrationWarning: true, children: r });
    case "meta":
      return jsx("meta", { ...t, suppressHydrationWarning: true });
    case "link":
      return jsx("link", { ...t, suppressHydrationWarning: true });
    case "style":
      return jsx("style", { ...t, dangerouslySetInnerHTML: { __html: r } });
    case "script":
      return t && t.src ? jsx("script", { ...t, suppressHydrationWarning: true }) : typeof r == "string" ? jsx("script", { ...t, dangerouslySetInnerHTML: { __html: r }, suppressHydrationWarning: true }) : null;
    default:
      return null;
  }
}
const Jt = () => {
  const e = useRouter(), t = useRouterState({ select: (a) => a.matches.map((s) => s.meta).filter(Boolean) }), r = x$2.useMemo(() => {
    const a = [], s = {};
    let c;
    return [...t].reverse().forEach((u) => {
      [...u].reverse().forEach((l) => {
        if (l.title)
          c || (c = { tag: "title", children: l.title });
        else {
          if (l.name) {
            if (s[l.name])
              return;
            s[l.name] = true;
          }
          a.push({ tag: "meta", attrs: { ...l } });
        }
      });
    }), c && a.push(c), a.reverse(), a;
  }, [t]), n = useRouterState({ select: (a) => a.matches.map((s) => s.links).filter(Boolean).flat(1).map((s) => ({ tag: "link", attrs: { ...s } })) }), o = useRouterState({ select: (a) => {
    const s = [];
    return a.matches.map((c) => e.looseRoutesById[c.routeId]).forEach((c) => {
      var u, l, d;
      return (d = (l = (u = e.manifest) == null ? void 0 : u.routes[c.id]) == null ? void 0 : l.preloads) == null ? void 0 : d.filter(Boolean).forEach((p) => {
        s.push({ tag: "link", attrs: { rel: "modulepreload", href: p } });
      });
    }), s;
  } });
  return Xt([...r, ...o, ...n], (a) => JSON.stringify(a));
}, Gt = () => {
  const e = useRouter(), t = Jt(), r = x$2.useContext(Z.get("TanStackRouterHydrationContext", {}));
  return jsxs(Fragment, { children: [jsx("meta", { name: "tsr-meta" }), t.map((n, o) => createElement(ne, { ...n, key: `tsr-meta-${JSON.stringify(n)}` })), jsxs(Fragment, { children: [jsx(ScriptOnce, { log: false, children: `
__TSR__ = {
  matches: [],
  streamedValues: {},
  initMatch: (index) => {
    Object.entries(__TSR__.matches[index].extracted).forEach(([id, ex]) => {
      if (ex.type === 'stream') {
        let controller;
        ex.value = new ReadableStream({
          start(c) { controller = c; }
        })
        ex.value.controller = controller
      } else if (ex.type === 'promise') {
        let r, j
        ex.value = new Promise((r_, j_) => { r = r_, j = j_ })
        ex.resolve = r; ex.reject = j
      }
    })
  },
  cleanScripts: () => {
    document.querySelectorAll('.tsr-once').forEach((el) => {
      el.remove()
    })
  },
}` }), jsx(ScriptOnce, { children: `__TSR__.dehydrated = ${k(e.options.transformer.stringify(r), { isScriptContext: true, wrap: true, json: true })}` })] }), jsx("meta", { name: "/tsr-meta" })] });
}, Kt = ({ children: e }) => {
  const t = useRouter(), r = Gt(), [n, o] = x$2.useState(false);
  x$2[typeof document < "u" ? "useLayoutEffect" : "useEffect"](() => {
    if (typeof document > "u")
      return;
    const s = document.head.querySelector('meta[name="tsr-meta"]'), c = document.head.querySelector('meta[name="/tsr-meta"]');
    let u = s == null ? void 0 : s.nextElementSibling;
    for (; u && u !== c; ) {
      const l = u.nextElementSibling;
      u.remove(), u = l;
    }
    s == null ? void 0 : s.remove(), c == null ? void 0 : c.remove(), o(true);
  }, []);
  const a = jsxs(Fragment, { children: [r, e] });
  return t.isServer ? a : n ? createPortal(a, document.head) : null;
};
function Vt({ children: e, ...t }) {
  return useRouter().isServer ? jsx("html", { children: e }) : jsx(Fragment, { children: e });
}
function Zt({ children: e, ...t }) {
  return useRouter().isServer ? jsx("head", { children: e }) : e;
}
function Qt({ children: e, ...t }) {
  return useRouter().isServer ? jsx("body", { children: jsx("div", { id: "root", children: e }) }) : e;
}
function Xt(e, t) {
  const r = /* @__PURE__ */ new Set();
  return e.filter((n) => {
    const o = t(n);
    return r.has(o) ? false : (r.add(o), true);
  });
}
const Yt = () => {
  const e = useRouter(), t = useRouterState({ select: (o) => {
    const a = [];
    return o.matches.map((s) => e.looseRoutesById[s.routeId]).forEach((s) => {
      var c, u, l;
      return (l = (u = (c = e.manifest) == null ? void 0 : c.routes[s.id]) == null ? void 0 : u.assets) == null ? void 0 : l.filter((d) => d.tag === "script").forEach((d) => {
        a.push({ tag: "script", attrs: d.attrs, children: d.children });
      });
    }), a;
  } }), { scripts: r } = useRouterState({ select: (o) => ({ scripts: o.matches.map((a) => a.scripts).filter(Boolean).flat(1).map(({ children: a, ...s }) => ({ tag: "script", attrs: { ...s, suppressHydrationWarning: true }, children: a })) }) }), n = [...r, ...t];
  return jsx(Fragment, { children: n.map((o, a) => createElement(ne, { ...o, key: `tsr-scripts-${o.tag}-${a}` })) });
}, se = createRootRoute({ meta: () => [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }, { title: "tssd" }], component: er, notFoundComponent: () => jsx(Ut, {}) });
function er() {
  return jsx(tr, { children: jsx(Outlet, {}) });
}
function tr({ children: e }) {
  return jsxs(Vt, { children: [jsx(Zt, { children: jsx(Kt, {}) }), jsxs(Qt, { children: [e, jsx(ScrollRestoration, {}), jsx(Yt, {})] })] });
}
const rr = () => import('./build/index-2rfRUrNU.mjs'), nr = () => import('./build/index-2rfRUrNU.mjs'), oe = createFileRoute("/")({ component: lazyRouteComponent(nr, "component", () => oe.ssr), loader: lazyFn(rr, "loader") }), sr = oe.update({ id: "/", path: "/", getParentRoute: () => se }), or = { IndexRoute: sr }, ar = se._addFileChildren(or)._addFileTypes();
function cr() {
  return createRouter$2({ routeTree: ar });
}
const br = At({ createRouter: cr, getRouterManifest: ze })(Wt);

const handlers = [
  { route: '', handler: _f4b49z, lazy: false, middleware: true, method: undefined },
  { route: '/_server', handler: ne$1, lazy: false, middleware: true, method: undefined },
  { route: '/api', handler: d, lazy: false, middleware: true, method: undefined },
  { route: '/', handler: br, lazy: false, middleware: true, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((_err) => {
      console.error("Error while capturing another error", _err);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      await nitroApp.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const localCall = createCall(toNodeListener(h3App));
  const _localFetch = createFetch(localCall, globalThis.fetch);
  const localFetch = (input, init) => _localFetch(input, init).then(
    (response) => normalizeFetchResponse(response)
  );
  const $fetch = createFetch$1({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  h3App.use(
    eventHandler((event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const envContext = event.node.req?.__unenv__;
      if (envContext) {
        Object.assign(event.context, envContext);
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (envContext?.waitUntil) {
          envContext.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
    })
  );
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  {
    const _handler = h3App.handler;
    h3App.handler = (event) => {
      const ctx = { event };
      return nitroAsyncContext.callAsync(ctx, () => _handler(event));
    };
  }
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  for (const plugin of plugins) {
    try {
      plugin(app);
    } catch (err) {
      captureError(err, { tags: ["plugin"] });
      throw err;
    }
  }
  return app;
}
const nitroApp = createNitroApp();
const useNitroApp = () => nitroApp;

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((err) => {
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http__default$1.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        destroy(socket);
      }
    }
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        destroy(socket);
      }
    }
  }
  server.on("request", function(req, res) {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", function() {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", function(socket) {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", function() {
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    if (options.development) {
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        return Promise.resolve(false);
      }
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((err) => {
      const errString = typeof err === "string" ? err : JSON.stringify(err);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT, 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((err) => {
          console.error(err);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { $t as $, Ne as N, St as S, _r as _, k$1 as a, nodeServer as b, eventHandler as e, gr as g, jt as j, kt as k, lt as l, node$1 as n, oe as o };
//# sourceMappingURL=runtime.mjs.map
