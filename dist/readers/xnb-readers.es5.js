/** 
 * xnb.js 1.1.0
 * made by Lybell( https://github.com/lybell-art/ )
 * This library is based on the XnbCli made by Leonblade.
 * 
 * xnb.js is licensed under the LGPL 3.0 License.
 * 
*/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.XNB = {}));
})(this, (function (exports) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	// eslint-disable-next-line es-x/no-typed-arrays -- safe
	var arrayBufferNative = typeof ArrayBuffer != 'undefined' && typeof DataView != 'undefined';

	var fails$9 = function (exec) {
		try {
			return !!exec();
		} catch (error) {
			return true;
		}
	};

	var fails$8 = fails$9;

	// Detect IE8's incomplete defineProperty implementation
	var descriptors = !fails$8(function () {
		// eslint-disable-next-line es-x/no-object-defineproperty -- required for testing
		return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var check = function (it) {
		return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global$q =
		// eslint-disable-next-line es-x/no-global-this -- safe
		check(typeof globalThis == 'object' && globalThis) ||
		check(typeof window == 'object' && window) ||
		// eslint-disable-next-line no-restricted-globals -- safe
		check(typeof self == 'object' && self) ||
		check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
		// eslint-disable-next-line no-new-func -- fallback
		(function () { return this; })() || Function('return this')();

	// `IsCallable` abstract operation
	// https://tc39.es/ecma262/#sec-iscallable
	var isCallable$e = function (argument) {
		return typeof argument == 'function';
	};

	var isCallable$d = isCallable$e;

	var isObject$7 = function (it) {
		return typeof it == 'object' ? it !== null : isCallable$d(it);
	};

	var fails$7 = fails$9;

	var functionBindNative = !fails$7(function () {
		// eslint-disable-next-line es-x/no-function-prototype-bind -- safe
		var test = (function () { /* empty */ }).bind();
		// eslint-disable-next-line no-prototype-builtins -- safe
		return typeof test != 'function' || test.hasOwnProperty('prototype');
	});

	var NATIVE_BIND$2 = functionBindNative;

	var FunctionPrototype$2 = Function.prototype;
	var bind$2 = FunctionPrototype$2.bind;
	var call$3 = FunctionPrototype$2.call;
	var uncurryThis$c = NATIVE_BIND$2 && bind$2.bind(call$3, call$3);

	var functionUncurryThis = NATIVE_BIND$2 ? function (fn) {
		return fn && uncurryThis$c(fn);
	} : function (fn) {
		return fn && function () {
			return call$3.apply(fn, arguments);
		};
	};

	var global$p = global$q;

	var TypeError$a = global$p.TypeError;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible$1 = function (it) {
		if (it == undefined) throw TypeError$a("Can't call method on " + it);
		return it;
	};

	var global$o = global$q;
	var requireObjectCoercible = requireObjectCoercible$1;

	var Object$5 = global$o.Object;

	// `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject
	var toObject$3 = function (argument) {
		return Object$5(requireObjectCoercible(argument));
	};

	var uncurryThis$b = functionUncurryThis;
	var toObject$2 = toObject$3;

	var hasOwnProperty = uncurryThis$b({}.hasOwnProperty);

	// `HasOwnProperty` abstract operation
	// https://tc39.es/ecma262/#sec-hasownproperty
	// eslint-disable-next-line es-x/no-object-hasown -- safe
	var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
		return hasOwnProperty(toObject$2(it), key);
	};

	var shared$3 = {exports: {}};

	var global$n = global$q;

	// eslint-disable-next-line es-x/no-object-defineproperty -- safe
	var defineProperty$3 = Object.defineProperty;

	var setGlobal$2 = function (key, value) {
		try {
			defineProperty$3(global$n, key, { value: value, configurable: true, writable: true });
		} catch (error) {
			global$n[key] = value;
		} return value;
	};

	var global$m = global$q;
	var setGlobal$1 = setGlobal$2;

	var SHARED = '__core-js_shared__';
	var store$3 = global$m[SHARED] || setGlobal$1(SHARED, {});

	var sharedStore = store$3;

	var store$2 = sharedStore;

	(shared$3.exports = function (key, value) {
		return store$2[key] || (store$2[key] = value !== undefined ? value : {});
	})('versions', []).push({
		version: '3.22.4',
		mode: 'global',
		copyright: '© 2014-2022 Denis Pushkarev (zloirock.ru)',
		license: 'https://github.com/zloirock/core-js/blob/v3.22.4/LICENSE',
		source: 'https://github.com/zloirock/core-js'
	});

	var uncurryThis$a = functionUncurryThis;

	var id = 0;
	var postfix = Math.random();
	var toString$1 = uncurryThis$a(1.0.toString);

	var uid$3 = function (key) {
		return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$1(++id + postfix, 36);
	};

	var global$l = global$q;
	var isCallable$c = isCallable$e;

	var aFunction = function (argument) {
		return isCallable$c(argument) ? argument : undefined;
	};

	var getBuiltIn$3 = function (namespace, method) {
		return arguments.length < 2 ? aFunction(global$l[namespace]) : global$l[namespace] && global$l[namespace][method];
	};

	var getBuiltIn$2 = getBuiltIn$3;

	var engineUserAgent = getBuiltIn$2('navigator', 'userAgent') || '';

	var global$k = global$q;
	var userAgent = engineUserAgent;

	var process = global$k.process;
	var Deno = global$k.Deno;
	var versions = process && process.versions || Deno && Deno.version;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
		match = v8.split('.');
		// in old Chrome, versions of V8 isn't V8 = Chrome / 10
		// but their correct versions are not interesting for us
		version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
	}

	// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
	// so check `userAgent` even if `.v8` exists, but 0
	if (!version && userAgent) {
		match = userAgent.match(/Edge\/(\d+)/);
		if (!match || match[1] >= 74) {
			match = userAgent.match(/Chrome\/(\d+)/);
			if (match) version = +match[1];
		}
	}

	var engineV8Version = version;

	/* eslint-disable es-x/no-symbol -- required for testing */

	var V8_VERSION = engineV8Version;
	var fails$6 = fails$9;

	// eslint-disable-next-line es-x/no-object-getownpropertysymbols -- required for testing
	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails$6(function () {
		var symbol = Symbol();
		// Chrome 38 Symbol has incorrect toString conversion
		// `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
		return !String(symbol) || !(Object(symbol) instanceof Symbol) ||
			// Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
			!Symbol.sham && V8_VERSION && V8_VERSION < 41;
	});

	/* eslint-disable es-x/no-symbol -- required for testing */

	var NATIVE_SYMBOL$1 = nativeSymbol;

	var useSymbolAsUid = NATIVE_SYMBOL$1
		&& !Symbol.sham
		&& typeof Symbol.iterator == 'symbol';

	var global$j = global$q;
	var shared$2 = shared$3.exports;
	var hasOwn$5 = hasOwnProperty_1;
	var uid$2 = uid$3;
	var NATIVE_SYMBOL = nativeSymbol;
	var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

	var WellKnownSymbolsStore = shared$2('wks');
	var Symbol$1 = global$j.Symbol;
	var symbolFor = Symbol$1 && Symbol$1['for'];
	var createWellKnownSymbol = USE_SYMBOL_AS_UID$1 ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$2;

	var wellKnownSymbol$6 = function (name) {
		if (!hasOwn$5(WellKnownSymbolsStore, name) || !(NATIVE_SYMBOL || typeof WellKnownSymbolsStore[name] == 'string')) {
			var description = 'Symbol.' + name;
			if (NATIVE_SYMBOL && hasOwn$5(Symbol$1, name)) {
				WellKnownSymbolsStore[name] = Symbol$1[name];
			} else if (USE_SYMBOL_AS_UID$1 && symbolFor) {
				WellKnownSymbolsStore[name] = symbolFor(description);
			} else {
				WellKnownSymbolsStore[name] = createWellKnownSymbol(description);
			}
		} return WellKnownSymbolsStore[name];
	};

	var wellKnownSymbol$5 = wellKnownSymbol$6;

	var TO_STRING_TAG$2 = wellKnownSymbol$5('toStringTag');
	var test = {};

	test[TO_STRING_TAG$2] = 'z';

	var toStringTagSupport = String(test) === '[object z]';

	var uncurryThis$9 = functionUncurryThis;

	var toString = uncurryThis$9({}.toString);
	var stringSlice = uncurryThis$9(''.slice);

	var classofRaw$1 = function (it) {
		return stringSlice(toString(it), 8, -1);
	};

	var global$i = global$q;
	var TO_STRING_TAG_SUPPORT = toStringTagSupport;
	var isCallable$b = isCallable$e;
	var classofRaw = classofRaw$1;
	var wellKnownSymbol$4 = wellKnownSymbol$6;

	var TO_STRING_TAG$1 = wellKnownSymbol$4('toStringTag');
	var Object$4 = global$i.Object;

	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
		try {
			return it[key];
		} catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof$4 = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
		var O, tag, result;
		return it === undefined ? 'Undefined' : it === null ? 'Null'
			// @@toStringTag case
			: typeof (tag = tryGet(O = Object$4(it), TO_STRING_TAG$1)) == 'string' ? tag
			// builtinTag case
			: CORRECT_ARGUMENTS ? classofRaw(O)
			// ES3 arguments fallback
			: (result = classofRaw(O)) == 'Object' && isCallable$b(O.callee) ? 'Arguments' : result;
	};

	var global$h = global$q;

	var String$3 = global$h.String;

	var tryToString$3 = function (argument) {
		try {
			return String$3(argument);
		} catch (error) {
			return 'Object';
		}
	};

	var objectDefineProperty = {};

	var global$g = global$q;
	var isObject$6 = isObject$7;

	var document = global$g.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS$1 = isObject$6(document) && isObject$6(document.createElement);

	var documentCreateElement = function (it) {
		return EXISTS$1 ? document.createElement(it) : {};
	};

	var DESCRIPTORS$6 = descriptors;
	var fails$5 = fails$9;
	var createElement = documentCreateElement;

	// Thanks to IE8 for its funny defineProperty
	var ie8DomDefine = !DESCRIPTORS$6 && !fails$5(function () {
		// eslint-disable-next-line es-x/no-object-defineproperty -- required for testing
		return Object.defineProperty(createElement('div'), 'a', {
			get: function () { return 7; }
		}).a != 7;
	});

	var DESCRIPTORS$5 = descriptors;
	var fails$4 = fails$9;

	// V8 ~ Chrome 36-
	// https://bugs.chromium.org/p/v8/issues/detail?id=3334
	var v8PrototypeDefineBug = DESCRIPTORS$5 && fails$4(function () {
		// eslint-disable-next-line es-x/no-object-defineproperty -- required for testing
		return Object.defineProperty(function () { /* empty */ }, 'prototype', {
			value: 42,
			writable: false
		}).prototype != 42;
	});

	var global$f = global$q;
	var isObject$5 = isObject$7;

	var String$2 = global$f.String;
	var TypeError$9 = global$f.TypeError;

	// `Assert: Type(argument) is Object`
	var anObject$3 = function (argument) {
		if (isObject$5(argument)) return argument;
		throw TypeError$9(String$2(argument) + ' is not an object');
	};

	var NATIVE_BIND$1 = functionBindNative;

	var call$2 = Function.prototype.call;

	var functionCall = NATIVE_BIND$1 ? call$2.bind(call$2) : function () {
		return call$2.apply(call$2, arguments);
	};

	var uncurryThis$8 = functionUncurryThis;

	var objectIsPrototypeOf = uncurryThis$8({}.isPrototypeOf);

	var global$e = global$q;
	var getBuiltIn$1 = getBuiltIn$3;
	var isCallable$a = isCallable$e;
	var isPrototypeOf$1 = objectIsPrototypeOf;
	var USE_SYMBOL_AS_UID = useSymbolAsUid;

	var Object$3 = global$e.Object;

	var isSymbol$2 = USE_SYMBOL_AS_UID ? function (it) {
		return typeof it == 'symbol';
	} : function (it) {
		var $Symbol = getBuiltIn$1('Symbol');
		return isCallable$a($Symbol) && isPrototypeOf$1($Symbol.prototype, Object$3(it));
	};

	var global$d = global$q;
	var isCallable$9 = isCallable$e;
	var tryToString$2 = tryToString$3;

	var TypeError$8 = global$d.TypeError;

	// `Assert: IsCallable(argument) is true`
	var aCallable$2 = function (argument) {
		if (isCallable$9(argument)) return argument;
		throw TypeError$8(tryToString$2(argument) + ' is not a function');
	};

	var aCallable$1 = aCallable$2;

	// `GetMethod` abstract operation
	// https://tc39.es/ecma262/#sec-getmethod
	var getMethod$1 = function (V, P) {
		var func = V[P];
		return func == null ? undefined : aCallable$1(func);
	};

	var global$c = global$q;
	var call$1 = functionCall;
	var isCallable$8 = isCallable$e;
	var isObject$4 = isObject$7;

	var TypeError$7 = global$c.TypeError;

	// `OrdinaryToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-ordinarytoprimitive
	var ordinaryToPrimitive$1 = function (input, pref) {
		var fn, val;
		if (pref === 'string' && isCallable$8(fn = input.toString) && !isObject$4(val = call$1(fn, input))) return val;
		if (isCallable$8(fn = input.valueOf) && !isObject$4(val = call$1(fn, input))) return val;
		if (pref !== 'string' && isCallable$8(fn = input.toString) && !isObject$4(val = call$1(fn, input))) return val;
		throw TypeError$7("Can't convert object to primitive value");
	};

	var global$b = global$q;
	var call = functionCall;
	var isObject$3 = isObject$7;
	var isSymbol$1 = isSymbol$2;
	var getMethod = getMethod$1;
	var ordinaryToPrimitive = ordinaryToPrimitive$1;
	var wellKnownSymbol$3 = wellKnownSymbol$6;

	var TypeError$6 = global$b.TypeError;
	var TO_PRIMITIVE = wellKnownSymbol$3('toPrimitive');

	// `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive
	var toPrimitive$1 = function (input, pref) {
		if (!isObject$3(input) || isSymbol$1(input)) return input;
		var exoticToPrim = getMethod(input, TO_PRIMITIVE);
		var result;
		if (exoticToPrim) {
			if (pref === undefined) pref = 'default';
			result = call(exoticToPrim, input, pref);
			if (!isObject$3(result) || isSymbol$1(result)) return result;
			throw TypeError$6("Can't convert object to primitive value");
		}
		if (pref === undefined) pref = 'number';
		return ordinaryToPrimitive(input, pref);
	};

	var toPrimitive = toPrimitive$1;
	var isSymbol = isSymbol$2;

	// `ToPropertyKey` abstract operation
	// https://tc39.es/ecma262/#sec-topropertykey
	var toPropertyKey$1 = function (argument) {
		var key = toPrimitive(argument, 'string');
		return isSymbol(key) ? key : key + '';
	};

	var global$a = global$q;
	var DESCRIPTORS$4 = descriptors;
	var IE8_DOM_DEFINE = ie8DomDefine;
	var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
	var anObject$2 = anObject$3;
	var toPropertyKey = toPropertyKey$1;

	var TypeError$5 = global$a.TypeError;
	// eslint-disable-next-line es-x/no-object-defineproperty -- safe
	var $defineProperty = Object.defineProperty;
	// eslint-disable-next-line es-x/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var ENUMERABLE = 'enumerable';
	var CONFIGURABLE$1 = 'configurable';
	var WRITABLE = 'writable';

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	objectDefineProperty.f = DESCRIPTORS$4 ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
		anObject$2(O);
		P = toPropertyKey(P);
		anObject$2(Attributes);
		if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
			var current = $getOwnPropertyDescriptor(O, P);
			if (current && current[WRITABLE]) {
				O[P] = Attributes.value;
				Attributes = {
					configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
					enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
					writable: false
				};
			}
		} return $defineProperty(O, P, Attributes);
	} : $defineProperty : function defineProperty(O, P, Attributes) {
		anObject$2(O);
		P = toPropertyKey(P);
		anObject$2(Attributes);
		if (IE8_DOM_DEFINE) try {
			return $defineProperty(O, P, Attributes);
		} catch (error) { /* empty */ }
		if ('get' in Attributes || 'set' in Attributes) throw TypeError$5('Accessors not supported');
		if ('value' in Attributes) O[P] = Attributes.value;
		return O;
	};

	var createPropertyDescriptor$1 = function (bitmap, value) {
		return {
			enumerable: !(bitmap & 1),
			configurable: !(bitmap & 2),
			writable: !(bitmap & 4),
			value: value
		};
	};

	var DESCRIPTORS$3 = descriptors;
	var definePropertyModule = objectDefineProperty;
	var createPropertyDescriptor = createPropertyDescriptor$1;

	var createNonEnumerableProperty$3 = DESCRIPTORS$3 ? function (object, key, value) {
		return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
		object[key] = value;
		return object;
	};

	var makeBuiltIn$2 = {exports: {}};

	var DESCRIPTORS$2 = descriptors;
	var hasOwn$4 = hasOwnProperty_1;

	var FunctionPrototype$1 = Function.prototype;
	// eslint-disable-next-line es-x/no-object-getownpropertydescriptor -- safe
	var getDescriptor = DESCRIPTORS$2 && Object.getOwnPropertyDescriptor;

	var EXISTS = hasOwn$4(FunctionPrototype$1, 'name');
	// additional protection from minified / mangled / dropped function names
	var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
	var CONFIGURABLE = EXISTS && (!DESCRIPTORS$2 || (DESCRIPTORS$2 && getDescriptor(FunctionPrototype$1, 'name').configurable));

	var functionName = {
		EXISTS: EXISTS,
		PROPER: PROPER,
		CONFIGURABLE: CONFIGURABLE
	};

	var uncurryThis$7 = functionUncurryThis;
	var isCallable$7 = isCallable$e;
	var store$1 = sharedStore;

	var functionToString$1 = uncurryThis$7(Function.toString);

	// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
	if (!isCallable$7(store$1.inspectSource)) {
		store$1.inspectSource = function (it) {
			return functionToString$1(it);
		};
	}

	var inspectSource$3 = store$1.inspectSource;

	var global$9 = global$q;
	var isCallable$6 = isCallable$e;
	var inspectSource$2 = inspectSource$3;

	var WeakMap$1 = global$9.WeakMap;

	var nativeWeakMap = isCallable$6(WeakMap$1) && /native code/.test(inspectSource$2(WeakMap$1));

	var shared$1 = shared$3.exports;
	var uid$1 = uid$3;

	var keys = shared$1('keys');

	var sharedKey$2 = function (key) {
		return keys[key] || (keys[key] = uid$1(key));
	};

	var hiddenKeys$1 = {};

	var NATIVE_WEAK_MAP = nativeWeakMap;
	var global$8 = global$q;
	var uncurryThis$6 = functionUncurryThis;
	var isObject$2 = isObject$7;
	var createNonEnumerableProperty$2 = createNonEnumerableProperty$3;
	var hasOwn$3 = hasOwnProperty_1;
	var shared = sharedStore;
	var sharedKey$1 = sharedKey$2;
	var hiddenKeys = hiddenKeys$1;

	var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
	var TypeError$4 = global$8.TypeError;
	var WeakMap = global$8.WeakMap;
	var set, get, has;

	var enforce = function (it) {
		return has(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
		return function (it) {
			var state;
			if (!isObject$2(it) || (state = get(it)).type !== TYPE) {
				throw TypeError$4('Incompatible receiver, ' + TYPE + ' required');
			} return state;
		};
	};

	if (NATIVE_WEAK_MAP || shared.state) {
		var store = shared.state || (shared.state = new WeakMap());
		var wmget = uncurryThis$6(store.get);
		var wmhas = uncurryThis$6(store.has);
		var wmset = uncurryThis$6(store.set);
		set = function (it, metadata) {
			if (wmhas(store, it)) throw new TypeError$4(OBJECT_ALREADY_INITIALIZED);
			metadata.facade = it;
			wmset(store, it, metadata);
			return metadata;
		};
		get = function (it) {
			return wmget(store, it) || {};
		};
		has = function (it) {
			return wmhas(store, it);
		};
	} else {
		var STATE = sharedKey$1('state');
		hiddenKeys[STATE] = true;
		set = function (it, metadata) {
			if (hasOwn$3(it, STATE)) throw new TypeError$4(OBJECT_ALREADY_INITIALIZED);
			metadata.facade = it;
			createNonEnumerableProperty$2(it, STATE, metadata);
			return metadata;
		};
		get = function (it) {
			return hasOwn$3(it, STATE) ? it[STATE] : {};
		};
		has = function (it) {
			return hasOwn$3(it, STATE);
		};
	}

	var internalState = {
		set: set,
		get: get,
		has: has,
		enforce: enforce,
		getterFor: getterFor
	};

	var fails$3 = fails$9;
	var isCallable$5 = isCallable$e;
	var hasOwn$2 = hasOwnProperty_1;
	var defineProperty$2 = objectDefineProperty.f;
	var CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE;
	var inspectSource$1 = inspectSource$3;
	var InternalStateModule = internalState;

	var enforceInternalState = InternalStateModule.enforce;
	var getInternalState = InternalStateModule.get;

	var CONFIGURABLE_LENGTH = !fails$3(function () {
		return defineProperty$2(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
	});

	var TEMPLATE = String(String).split('String');

	var makeBuiltIn$1 = makeBuiltIn$2.exports = function (value, name, options) {
		if (String(name).slice(0, 7) === 'Symbol(') {
			name = '[' + String(name).replace(/^Symbol\(([^)]*)\)/, '$1') + ']';
		}
		if (options && options.getter) name = 'get ' + name;
		if (options && options.setter) name = 'set ' + name;
		if (!hasOwn$2(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
			defineProperty$2(value, 'name', { value: name, configurable: true });
		}
		if (CONFIGURABLE_LENGTH && options && hasOwn$2(options, 'arity') && value.length !== options.arity) {
			defineProperty$2(value, 'length', { value: options.arity });
		}
		var state = enforceInternalState(value);
		if (!hasOwn$2(state, 'source')) {
			state.source = TEMPLATE.join(typeof name == 'string' ? name : '');
		} return value;
	};

	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	// eslint-disable-next-line no-extend-native -- required
	Function.prototype.toString = makeBuiltIn$1(function toString() {
		return isCallable$5(this) && getInternalState(this).source || inspectSource$1(this);
	}, 'toString');

	var global$7 = global$q;
	var isCallable$4 = isCallable$e;
	var createNonEnumerableProperty$1 = createNonEnumerableProperty$3;
	var makeBuiltIn = makeBuiltIn$2.exports;
	var setGlobal = setGlobal$2;

	var defineBuiltIn$1 = function (O, key, value, options) {
		var unsafe = options ? !!options.unsafe : false;
		var simple = options ? !!options.enumerable : false;
		var noTargetGet = options ? !!options.noTargetGet : false;
		var name = options && options.name !== undefined ? options.name : key;
		if (isCallable$4(value)) makeBuiltIn(value, name, options);
		if (O === global$7) {
			if (simple) O[key] = value;
			else setGlobal(key, value);
			return O;
		} else if (!unsafe) {
			delete O[key];
		} else if (!noTargetGet && O[key]) {
			simple = true;
		}
		if (simple) O[key] = value;
		else createNonEnumerableProperty$1(O, key, value);
		return O;
	};

	var fails$2 = fails$9;

	var correctPrototypeGetter = !fails$2(function () {
		function F() { /* empty */ }
		F.prototype.constructor = null;
		// eslint-disable-next-line es-x/no-object-getprototypeof -- required for testing
		return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var global$6 = global$q;
	var hasOwn$1 = hasOwnProperty_1;
	var isCallable$3 = isCallable$e;
	var toObject$1 = toObject$3;
	var sharedKey = sharedKey$2;
	var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

	var IE_PROTO = sharedKey('IE_PROTO');
	var Object$2 = global$6.Object;
	var ObjectPrototype$1 = Object$2.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? Object$2.getPrototypeOf : function (O) {
		var object = toObject$1(O);
		if (hasOwn$1(object, IE_PROTO)) return object[IE_PROTO];
		var constructor = object.constructor;
		if (isCallable$3(constructor) && object instanceof constructor) {
			return constructor.prototype;
		} return object instanceof Object$2 ? ObjectPrototype$1 : null;
	};

	var global$5 = global$q;
	var isCallable$2 = isCallable$e;

	var String$1 = global$5.String;
	var TypeError$3 = global$5.TypeError;

	var aPossiblePrototype$1 = function (argument) {
		if (typeof argument == 'object' || isCallable$2(argument)) return argument;
		throw TypeError$3("Can't set " + String$1(argument) + ' as a prototype');
	};

	/* eslint-disable no-proto -- safe */

	var uncurryThis$5 = functionUncurryThis;
	var anObject$1 = anObject$3;
	var aPossiblePrototype = aPossiblePrototype$1;

	// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	// eslint-disable-next-line es-x/no-object-setprototypeof -- safe
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
		var CORRECT_SETTER = false;
		var test = {};
		var setter;
		try {
			// eslint-disable-next-line es-x/no-object-getownpropertydescriptor -- safe
			setter = uncurryThis$5(Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set);
			setter(test, []);
			CORRECT_SETTER = test instanceof Array;
		} catch (error) { /* empty */ }
		return function setPrototypeOf(O, proto) {
			anObject$1(O);
			aPossiblePrototype(proto);
			if (CORRECT_SETTER) setter(O, proto);
			else O.__proto__ = proto;
			return O;
		};
	}() : undefined);

	var NATIVE_ARRAY_BUFFER = arrayBufferNative;
	var DESCRIPTORS$1 = descriptors;
	var global$4 = global$q;
	var isCallable$1 = isCallable$e;
	var isObject$1 = isObject$7;
	var hasOwn = hasOwnProperty_1;
	var classof$3 = classof$4;
	var tryToString$1 = tryToString$3;
	var createNonEnumerableProperty = createNonEnumerableProperty$3;
	var defineBuiltIn = defineBuiltIn$1;
	var defineProperty$1 = objectDefineProperty.f;
	var isPrototypeOf = objectIsPrototypeOf;
	var getPrototypeOf = objectGetPrototypeOf;
	var setPrototypeOf = objectSetPrototypeOf;
	var wellKnownSymbol$2 = wellKnownSymbol$6;
	var uid = uid$3;

	var Int8Array = global$4.Int8Array;
	var Int8ArrayPrototype = Int8Array && Int8Array.prototype;
	var Uint8ClampedArray = global$4.Uint8ClampedArray;
	var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
	var TypedArray = Int8Array && getPrototypeOf(Int8Array);
	var TypedArrayPrototype = Int8ArrayPrototype && getPrototypeOf(Int8ArrayPrototype);
	var ObjectPrototype = Object.prototype;
	var TypeError$2 = global$4.TypeError;

	var TO_STRING_TAG = wellKnownSymbol$2('toStringTag');
	var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
	var TYPED_ARRAY_CONSTRUCTOR$1 = uid('TYPED_ARRAY_CONSTRUCTOR');
	// Fixing native typed arrays in Opera Presto crashes the browser, see #595
	var NATIVE_ARRAY_BUFFER_VIEWS = NATIVE_ARRAY_BUFFER && !!setPrototypeOf && classof$3(global$4.opera) !== 'Opera';
	var TYPED_ARRAY_TAG_REQUIRED = false;
	var NAME$1, Constructor, Prototype;

	var TypedArrayConstructorsList = {
		Int8Array: 1,
		Uint8Array: 1,
		Uint8ClampedArray: 1,
		Int16Array: 2,
		Uint16Array: 2,
		Int32Array: 4,
		Uint32Array: 4,
		Float32Array: 4,
		Float64Array: 8
	};

	var BigIntArrayConstructorsList = {
		BigInt64Array: 8,
		BigUint64Array: 8
	};

	var isView = function isView(it) {
		if (!isObject$1(it)) return false;
		var klass = classof$3(it);
		return klass === 'DataView'
			|| hasOwn(TypedArrayConstructorsList, klass)
			|| hasOwn(BigIntArrayConstructorsList, klass);
	};

	var isTypedArray = function (it) {
		if (!isObject$1(it)) return false;
		var klass = classof$3(it);
		return hasOwn(TypedArrayConstructorsList, klass)
			|| hasOwn(BigIntArrayConstructorsList, klass);
	};

	var aTypedArray$1 = function (it) {
		if (isTypedArray(it)) return it;
		throw TypeError$2('Target is not a typed array');
	};

	var aTypedArrayConstructor$1 = function (C) {
		if (isCallable$1(C) && (!setPrototypeOf || isPrototypeOf(TypedArray, C))) return C;
		throw TypeError$2(tryToString$1(C) + ' is not a typed array constructor');
	};

	var exportTypedArrayMethod$1 = function (KEY, property, forced, options) {
		if (!DESCRIPTORS$1) return;
		if (forced) for (var ARRAY in TypedArrayConstructorsList) {
			var TypedArrayConstructor = global$4[ARRAY];
			if (TypedArrayConstructor && hasOwn(TypedArrayConstructor.prototype, KEY)) try {
				delete TypedArrayConstructor.prototype[KEY];
			} catch (error) {
				// old WebKit bug - some methods are non-configurable
				try {
					TypedArrayConstructor.prototype[KEY] = property;
				} catch (error2) { /* empty */ }
			}
		}
		if (!TypedArrayPrototype[KEY] || forced) {
			defineBuiltIn(TypedArrayPrototype, KEY, forced ? property
				: NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[KEY] || property, options);
		}
	};

	var exportTypedArrayStaticMethod = function (KEY, property, forced) {
		var ARRAY, TypedArrayConstructor;
		if (!DESCRIPTORS$1) return;
		if (setPrototypeOf) {
			if (forced) for (ARRAY in TypedArrayConstructorsList) {
				TypedArrayConstructor = global$4[ARRAY];
				if (TypedArrayConstructor && hasOwn(TypedArrayConstructor, KEY)) try {
					delete TypedArrayConstructor[KEY];
				} catch (error) { /* empty */ }
			}
			if (!TypedArray[KEY] || forced) {
				// V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
				try {
					return defineBuiltIn(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && TypedArray[KEY] || property);
				} catch (error) { /* empty */ }
			} else return;
		}
		for (ARRAY in TypedArrayConstructorsList) {
			TypedArrayConstructor = global$4[ARRAY];
			if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
				defineBuiltIn(TypedArrayConstructor, KEY, property);
			}
		}
	};

	for (NAME$1 in TypedArrayConstructorsList) {
		Constructor = global$4[NAME$1];
		Prototype = Constructor && Constructor.prototype;
		if (Prototype) createNonEnumerableProperty(Prototype, TYPED_ARRAY_CONSTRUCTOR$1, Constructor);
		else NATIVE_ARRAY_BUFFER_VIEWS = false;
	}

	for (NAME$1 in BigIntArrayConstructorsList) {
		Constructor = global$4[NAME$1];
		Prototype = Constructor && Constructor.prototype;
		if (Prototype) createNonEnumerableProperty(Prototype, TYPED_ARRAY_CONSTRUCTOR$1, Constructor);
	}

	// WebKit bug - typed arrays constructors prototype is Object.prototype
	if (!NATIVE_ARRAY_BUFFER_VIEWS || !isCallable$1(TypedArray) || TypedArray === Function.prototype) {
		// eslint-disable-next-line no-shadow -- safe
		TypedArray = function TypedArray() {
			throw TypeError$2('Incorrect invocation');
		};
		if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME$1 in TypedArrayConstructorsList) {
			if (global$4[NAME$1]) setPrototypeOf(global$4[NAME$1], TypedArray);
		}
	}

	if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype) {
		TypedArrayPrototype = TypedArray.prototype;
		if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME$1 in TypedArrayConstructorsList) {
			if (global$4[NAME$1]) setPrototypeOf(global$4[NAME$1].prototype, TypedArrayPrototype);
		}
	}

	// WebKit bug - one more object in Uint8ClampedArray prototype chain
	if (NATIVE_ARRAY_BUFFER_VIEWS && getPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
		setPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
	}

	if (DESCRIPTORS$1 && !hasOwn(TypedArrayPrototype, TO_STRING_TAG)) {
		TYPED_ARRAY_TAG_REQUIRED = true;
		defineProperty$1(TypedArrayPrototype, TO_STRING_TAG, { get: function () {
			return isObject$1(this) ? this[TYPED_ARRAY_TAG] : undefined;
		} });
		for (NAME$1 in TypedArrayConstructorsList) if (global$4[NAME$1]) {
			createNonEnumerableProperty(global$4[NAME$1], TYPED_ARRAY_TAG, NAME$1);
		}
	}

	var arrayBufferViewCore = {
		NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
		TYPED_ARRAY_CONSTRUCTOR: TYPED_ARRAY_CONSTRUCTOR$1,
		TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQUIRED && TYPED_ARRAY_TAG,
		aTypedArray: aTypedArray$1,
		aTypedArrayConstructor: aTypedArrayConstructor$1,
		exportTypedArrayMethod: exportTypedArrayMethod$1,
		exportTypedArrayStaticMethod: exportTypedArrayStaticMethod,
		isView: isView,
		isTypedArray: isTypedArray,
		TypedArray: TypedArray,
		TypedArrayPrototype: TypedArrayPrototype
	};

	var uncurryThis$4 = functionUncurryThis;
	var aCallable = aCallable$2;
	var NATIVE_BIND = functionBindNative;

	var bind$1 = uncurryThis$4(uncurryThis$4.bind);

	// optional / simple context binding
	var functionBindContext = function (fn, that) {
		aCallable(fn);
		return that === undefined ? fn : NATIVE_BIND ? bind$1(fn, that) : function (/* ...args */) {
			return fn.apply(that, arguments);
		};
	};

	var global$3 = global$q;
	var uncurryThis$3 = functionUncurryThis;
	var fails$1 = fails$9;
	var classof$2 = classofRaw$1;

	var Object$1 = global$3.Object;
	var split = uncurryThis$3(''.split);

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails$1(function () {
		// throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
		// eslint-disable-next-line no-prototype-builtins -- safe
		return !Object$1('z').propertyIsEnumerable(0);
	}) ? function (it) {
		return classof$2(it) == 'String' ? split(it, '') : Object$1(it);
	} : Object$1;

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToIntegerOrInfinity` abstract operation
	// https://tc39.es/ecma262/#sec-tointegerorinfinity
	var toIntegerOrInfinity$1 = function (argument) {
		var number = +argument;
		// eslint-disable-next-line no-self-compare -- safe
		return number !== number || number === 0 ? 0 : (number > 0 ? floor : ceil)(number);
	};

	var toIntegerOrInfinity = toIntegerOrInfinity$1;

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength
	var toLength$1 = function (argument) {
		return argument > 0 ? min(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var toLength = toLength$1;

	// `LengthOfArrayLike` abstract operation
	// https://tc39.es/ecma262/#sec-lengthofarraylike
	var lengthOfArrayLike$1 = function (obj) {
		return toLength(obj.length);
	};

	var classof$1 = classofRaw$1;

	// `IsArray` abstract operation
	// https://tc39.es/ecma262/#sec-isarray
	// eslint-disable-next-line es-x/no-array-isarray -- safe
	var isArray$1 = Array.isArray || function isArray(argument) {
		return classof$1(argument) == 'Array';
	};

	var uncurryThis$2 = functionUncurryThis;
	var fails = fails$9;
	var isCallable = isCallable$e;
	var classof = classof$4;
	var getBuiltIn = getBuiltIn$3;
	var inspectSource = inspectSource$3;

	var noop = function () { /* empty */ };
	var empty = [];
	var construct = getBuiltIn('Reflect', 'construct');
	var constructorRegExp = /^\s*(?:class|function)\b/;
	var exec = uncurryThis$2(constructorRegExp.exec);
	var INCORRECT_TO_STRING = !constructorRegExp.exec(noop);

	var isConstructorModern = function isConstructor(argument) {
		if (!isCallable(argument)) return false;
		try {
			construct(noop, empty, argument);
			return true;
		} catch (error) {
			return false;
		}
	};

	var isConstructorLegacy = function isConstructor(argument) {
		if (!isCallable(argument)) return false;
		switch (classof(argument)) {
			case 'AsyncFunction':
			case 'GeneratorFunction':
			case 'AsyncGeneratorFunction': return false;
		}
		try {
			// we can't check .prototype since constructors produced by .bind haven't it
			// `Function#toString` throws on some built-it function in some legacy engines
			// (for example, `DOMQuad` and similar in FF41-)
			return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
		} catch (error) {
			return true;
		}
	};

	isConstructorLegacy.sham = true;

	// `IsConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-isconstructor
	var isConstructor$2 = !construct || fails(function () {
		var called;
		return isConstructorModern(isConstructorModern.call)
			|| !isConstructorModern(Object)
			|| !isConstructorModern(function () { called = true; })
			|| called;
	}) ? isConstructorLegacy : isConstructorModern;

	var global$2 = global$q;
	var isArray = isArray$1;
	var isConstructor$1 = isConstructor$2;
	var isObject = isObject$7;
	var wellKnownSymbol$1 = wellKnownSymbol$6;

	var SPECIES$1 = wellKnownSymbol$1('species');
	var Array$1 = global$2.Array;

	// a part of `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	var arraySpeciesConstructor$1 = function (originalArray) {
		var C;
		if (isArray(originalArray)) {
			C = originalArray.constructor;
			// cross-realm fallback
			if (isConstructor$1(C) && (C === Array$1 || isArray(C.prototype))) C = undefined;
			else if (isObject(C)) {
				C = C[SPECIES$1];
				if (C === null) C = undefined;
			}
		} return C === undefined ? Array$1 : C;
	};

	var arraySpeciesConstructor = arraySpeciesConstructor$1;

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate$1 = function (originalArray, length) {
		return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
	};

	var bind = functionBindContext;
	var uncurryThis$1 = functionUncurryThis;
	var IndexedObject = indexedObject;
	var toObject = toObject$3;
	var lengthOfArrayLike = lengthOfArrayLike$1;
	var arraySpeciesCreate = arraySpeciesCreate$1;

	var push = uncurryThis$1([].push);

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
	var createMethod = function (TYPE) {
		var IS_MAP = TYPE == 1;
		var IS_FILTER = TYPE == 2;
		var IS_SOME = TYPE == 3;
		var IS_EVERY = TYPE == 4;
		var IS_FIND_INDEX = TYPE == 6;
		var IS_FILTER_REJECT = TYPE == 7;
		var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
		return function ($this, callbackfn, that, specificCreate) {
			var O = toObject($this);
			var self = IndexedObject(O);
			var boundFunction = bind(callbackfn, that);
			var length = lengthOfArrayLike(self);
			var index = 0;
			var create = specificCreate || arraySpeciesCreate;
			var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
			var value, result;
			for (;length > index; index++) if (NO_HOLES || index in self) {
				value = self[index];
				result = boundFunction(value, index, O);
				if (TYPE) {
					if (IS_MAP) target[index] = result; // map
					else if (result) switch (TYPE) {
						case 3: return true;							// some
						case 5: return value;						 // find
						case 6: return index;						 // findIndex
						case 2: push(target, value);			// filter
					} else switch (TYPE) {
						case 4: return false;						 // every
						case 7: push(target, value);			// filterReject
					}
				}
			}
			return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
		};
	};

	var arrayIteration = {
		// `Array.prototype.forEach` method
		// https://tc39.es/ecma262/#sec-array.prototype.foreach
		forEach: createMethod(0),
		// `Array.prototype.map` method
		// https://tc39.es/ecma262/#sec-array.prototype.map
		map: createMethod(1),
		// `Array.prototype.filter` method
		// https://tc39.es/ecma262/#sec-array.prototype.filter
		filter: createMethod(2),
		// `Array.prototype.some` method
		// https://tc39.es/ecma262/#sec-array.prototype.some
		some: createMethod(3),
		// `Array.prototype.every` method
		// https://tc39.es/ecma262/#sec-array.prototype.every
		every: createMethod(4),
		// `Array.prototype.find` method
		// https://tc39.es/ecma262/#sec-array.prototype.find
		find: createMethod(5),
		// `Array.prototype.findIndex` method
		// https://tc39.es/ecma262/#sec-array.prototype.findIndex
		findIndex: createMethod(6),
		// `Array.prototype.filterReject` method
		// https://github.com/tc39/proposal-array-filtering
		filterReject: createMethod(7)
	};

	var global$1 = global$q;
	var isConstructor = isConstructor$2;
	var tryToString = tryToString$3;

	var TypeError$1 = global$1.TypeError;

	// `Assert: IsConstructor(argument) is true`
	var aConstructor$1 = function (argument) {
		if (isConstructor(argument)) return argument;
		throw TypeError$1(tryToString(argument) + ' is not a constructor');
	};

	var anObject = anObject$3;
	var aConstructor = aConstructor$1;
	var wellKnownSymbol = wellKnownSymbol$6;

	var SPECIES = wellKnownSymbol('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-speciesconstructor
	var speciesConstructor$1 = function (O, defaultConstructor) {
		var C = anObject(O).constructor;
		var S;
		return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? defaultConstructor : aConstructor(S);
	};

	var ArrayBufferViewCore$1 = arrayBufferViewCore;
	var speciesConstructor = speciesConstructor$1;

	var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore$1.TYPED_ARRAY_CONSTRUCTOR;
	var aTypedArrayConstructor = ArrayBufferViewCore$1.aTypedArrayConstructor;

	// a part of `TypedArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#typedarray-species-create
	var typedArraySpeciesConstructor$1 = function (originalArray) {
		return aTypedArrayConstructor(speciesConstructor(originalArray, originalArray[TYPED_ARRAY_CONSTRUCTOR]));
	};

	var ArrayBufferViewCore = arrayBufferViewCore;
	var $map = arrayIteration.map;
	var typedArraySpeciesConstructor = typedArraySpeciesConstructor$1;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.map` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
	exportTypedArrayMethod('map', function map(mapfn /* , thisArg */) {
		return $map(aTypedArray(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
			return new (typedArraySpeciesConstructor(O))(length);
		});
	});

	var DESCRIPTORS = descriptors;
	var FUNCTION_NAME_EXISTS = functionName.EXISTS;
	var uncurryThis = functionUncurryThis;
	var defineProperty = objectDefineProperty.f;

	var FunctionPrototype = Function.prototype;
	var functionToString = uncurryThis(FunctionPrototype.toString);
	var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
	var regExpExec = uncurryThis(nameRE.exec);
	var NAME = 'name';

	// Function instances `.name` property
	// https://tc39.es/ecma262/#sec-function-instances-name
	if (DESCRIPTORS && !FUNCTION_NAME_EXISTS) {
		defineProperty(FunctionPrototype, NAME, {
			configurable: true,
			get: function () {
				try {
					return regExpExec(nameRE, functionToString(this))[1];
				} catch (error) {
					return '';
				}
			}
		});
	}

	function ownKeys(object, enumerableOnly) {
		var keys = Object.keys(object);

		if (Object.getOwnPropertySymbols) {
			var symbols = Object.getOwnPropertySymbols(object);
			enumerableOnly && (symbols = symbols.filter(function (sym) {
				return Object.getOwnPropertyDescriptor(object, sym).enumerable;
			})), keys.push.apply(keys, symbols);
		}

		return keys;
	}

	function _objectSpread2(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = null != arguments[i] ? arguments[i] : {};
			i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
				_defineProperty(target, key, source[key]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
				Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
			});
		}

		return target;
	}

	function _typeof(obj) {
		"@babel/helpers - typeof";

		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
			return typeof obj;
		} : function (obj) {
			return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		}, _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		Object.defineProperty(Constructor, "prototype", {
			writable: false
		});
		return Constructor;
	}

	function _defineProperty(obj, key, value) {
		if (key in obj) {
			Object.defineProperty(obj, key, {
				value: value,
				enumerable: true,
				configurable: true,
				writable: true
			});
		} else {
			obj[key] = value;
		}

		return obj;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function");
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				writable: true,
				configurable: true
			}
		});
		Object.defineProperty(subClass, "prototype", {
			writable: false
		});
		if (superClass) _setPrototypeOf(subClass, superClass);
	}

	function _getPrototypeOf(o) {
		_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
			return o.__proto__ || Object.getPrototypeOf(o);
		};
		return _getPrototypeOf(o);
	}

	function _setPrototypeOf(o, p) {
		_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
			o.__proto__ = p;
			return o;
		};

		return _setPrototypeOf(o, p);
	}

	function _isNativeReflectConstruct() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;

		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
			return true;
		} catch (e) {
			return false;
		}
	}

	function _construct(Parent, args, Class) {
		if (_isNativeReflectConstruct()) {
			_construct = Reflect.construct;
		} else {
			_construct = function _construct(Parent, args, Class) {
				var a = [null];
				a.push.apply(a, args);
				var Constructor = Function.bind.apply(Parent, a);
				var instance = new Constructor();
				if (Class) _setPrototypeOf(instance, Class.prototype);
				return instance;
			};
		}

		return _construct.apply(null, arguments);
	}

	function _assertThisInitialized(self) {
		if (self === void 0) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return self;
	}

	function _possibleConstructorReturn(self, call) {
		if (call && (typeof call === "object" || typeof call === "function")) {
			return call;
		} else if (call !== void 0) {
			throw new TypeError("Derived constructors may only return object or undefined");
		}

		return _assertThisInitialized(self);
	}

	function _createSuper(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct();

		return function _createSuperInternal() {
			var Super = _getPrototypeOf(Derived),
					result;

			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf(this).constructor;

				result = Reflect.construct(Super, arguments, NewTarget);
			} else {
				result = Super.apply(this, arguments);
			}

			return _possibleConstructorReturn(this, result);
		};
	}

	var BaseReader = function () {
		function BaseReader() {
			_classCallCheck(this, BaseReader);
		}

		_createClass(BaseReader, [{
			key: "isValueType",
			value: function isValueType() {
				return true;
			}
		}, {
			key: "type",
			get: function get() {
				return this.constructor.type();
			}
		}, {
			key: "read",
			value: function read(buffer, resolver) {
				throw new Error('Cannot invoke methods on abstract class.');
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				throw new Error('Cannot invoke methods on abstract class.');
			}
		}, {
			key: "writeIndex",
			value: function writeIndex(buffer, resolver) {
				if (resolver != null) buffer.write7BitNumber(parseInt(resolver.getIndex(this)) + 1);
			}
		}, {
			key: "toString",
			value: function toString() {
				return this.type;
			}
		}, {
			key: "parseTypeList",
			value: function parseTypeList() {
				return this.constructor.parseTypeList();
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				return false;
			}
		}, {
			key: "hasSubType",
			value: function hasSubType() {
				return false;
			}
		}, {
			key: "parseTypeList",
			value: function parseTypeList() {
				return [this.type()];
			}
		}, {
			key: "type",
			value: function type() {
				return this.name.slice(0, -6);
			}
		}]);

		return BaseReader;
	}();

	var UInt32Reader = function (_BaseReader) {
		_inherits(UInt32Reader, _BaseReader);

		var _super = _createSuper(UInt32Reader);

		function UInt32Reader() {
			_classCallCheck(this, UInt32Reader);

			return _super.apply(this, arguments);
		}

		_createClass(UInt32Reader, [{
			key: "read",
			value: function read(buffer) {
				return buffer.readUInt32();
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				buffer.writeUInt32(content);
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.UInt32Reader':
					case 'System.UInt32':
						return true;

					default:
						return false;
				}
			}
		}]);

		return UInt32Reader;
	}(BaseReader);

	var ArrayReader = function (_BaseReader) {
		_inherits(ArrayReader, _BaseReader);

		var _super = _createSuper(ArrayReader);

		function ArrayReader(reader) {
			var _this;

			_classCallCheck(this, ArrayReader);

			_this = _super.call(this);
			_this.reader = reader;
			return _this;
		}

		_createClass(ArrayReader, [{
			key: "read",
			value: function read(buffer, resolver) {
				var uint32Reader = new UInt32Reader();
				var size = uint32Reader.read(buffer);
				var array = [];

				for (var i = 0; i < size; i++) {
					var value = this.reader.isValueType() ? this.reader.read(buffer) : resolver.read(buffer);
					array.push(value);
				}

				return array;
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				var uint32Reader = new UInt32Reader();
				uint32Reader.write(buffer, content.length, resolver);

				for (var i = 0; i < content.length; i++) {
					this.reader.write(buffer, content[i], this.reader.isValueType() ? null : resolver);
				}
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}, {
			key: "type",
			get: function get() {
				return "Array<".concat(this.reader.type, ">");
			}
		}, {
			key: "parseTypeList",
			value: function parseTypeList() {
				return [this.type].concat(this.reader.parseTypeList());
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.ArrayReader':
						return true;

					default:
						return false;
				}
			}
		}, {
			key: "hasSubType",
			value: function hasSubType() {
				return true;
			}
		}]);

		return ArrayReader;
	}(BaseReader);

	function __arrayMaker(obj, func) {
		if (!obj || _typeof(obj) !== "object") throw new Error("Invalid Data!");
		var result = [];
		var length = obj.length;

		for (var i = 0; i < length; i++) {
			result[i] = func(obj[i], i);
		}

		return result;
	}

	function __trunc(number) {
		if (number < 0) return Math.ceil(number);
		return Math.floor(number);
	}

	Promise.allSettled !== undefined ? Promise.allSettled.bind(Promise) : function (promises) {
		var mappedPromises = promises.map(function (p) {
			return p.then(function (value) {
				return {
					status: 'fulfilled',
					value: value
				};
			}).catch(function (reason) {
				return {
					status: 'rejected',
					reason: reason
				};
			});
		});
		return Promise.all(mappedPromises);
	};

	var UTF16_BITES = [0xD800, 0xDC00];
	var UTF16_MASK = 1023;

	function UTF16Decode(codeSet) {
		var _codeSet2;

		if (typeof codeSet === "number") codeSet = [codeSet];
		if (!((_codeSet2 = codeSet) !== null && _codeSet2 !== void 0 && _codeSet2.length)) throw new Error("Invalid codeset!");
		var codeSetRange = codeSet.length;
		if (codeSetRange === 1) return codeSet[0];
		return ((codeSet[0] & UTF16_MASK) << 10) + (codeSet[1] & UTF16_MASK) + 0x10000;
	}

	function stringToUnicode(str) {
		var utf16Map = __arrayMaker({
			length: str.length
		}, function (_, i) {
			return str.charCodeAt(i);
		});

		var result = [];
		var index = 0;

		while (index < str.length) {
			var code = utf16Map[index];

			if ((UTF16_BITES[0] & code) !== UTF16_BITES[0]) {
				result.push(code);
				index++;
			} else {
				result.push(UTF16Decode(utf16Map.slice(index, index + 2)));
				index += 2;
			}
		}

		return result;
	}

	function UTF8Length(str) {
		var codes = stringToUnicode(str);
		return codes.reduce(function (sum, unicode) {
			if (unicode < 0x80) return sum + 1;
			if (unicode < 0x800) return sum + 2;
			if (unicode < 0x10000) return sum + 3;
			return sum + 4;
		}, 0);
	}

	var StringReader = function (_BaseReader) {
		_inherits(StringReader, _BaseReader);

		var _super = _createSuper(StringReader);

		function StringReader() {
			_classCallCheck(this, StringReader);

			return _super.apply(this, arguments);
		}

		_createClass(StringReader, [{
			key: "read",
			value: function read(buffer) {
				var length = buffer.read7BitNumber();
				return buffer.readString(length);
			}
		}, {
			key: "write",
			value: function write(buffer, string, resolver) {
				this.writeIndex(buffer, resolver);
				var size = UTF8Length(string);
				buffer.write7BitNumber(size);
				buffer.writeString(string);
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.StringReader':
					case 'System.String':
						return true;

					default:
						return false;
				}
			}
		}]);

		return StringReader;
	}(BaseReader);

	var BmFontReader = function (_BaseReader) {
		_inherits(BmFontReader, _BaseReader);

		var _super = _createSuper(BmFontReader);

		function BmFontReader() {
			_classCallCheck(this, BmFontReader);

			return _super.apply(this, arguments);
		}

		_createClass(BmFontReader, [{
			key: "read",
			value: function read(buffer) {
				var stringReader = new StringReader();
				var xml = stringReader.read(buffer);
				return {
					export: {
						type: this.type,
						data: xml
					}
				};
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				var stringReader = new StringReader();
				stringReader.write(buffer, content.export.data, null);
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'BmFont.XmlSourceReader':
						return true;

					default:
						return false;
				}
			}
		}]);

		return BmFontReader;
	}(BaseReader);

	var BooleanReader = function (_BaseReader) {
		_inherits(BooleanReader, _BaseReader);

		var _super = _createSuper(BooleanReader);

		function BooleanReader() {
			_classCallCheck(this, BooleanReader);

			return _super.apply(this, arguments);
		}

		_createClass(BooleanReader, [{
			key: "read",
			value: function read(buffer) {
				return Boolean(buffer.readInt());
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				buffer.writeByte(content);
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.BooleanReader':
					case 'System.Boolean':
						return true;

					default:
						return false;
				}
			}
		}]);

		return BooleanReader;
	}(BaseReader);

	var CharReader = function (_BaseReader) {
		_inherits(CharReader, _BaseReader);

		var _super = _createSuper(CharReader);

		function CharReader() {
			_classCallCheck(this, CharReader);

			return _super.apply(this, arguments);
		}

		_createClass(CharReader, [{
			key: "read",
			value: function read(buffer) {
				var charSize = this._getCharSize(buffer.peekInt());

				return buffer.readString(charSize);
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				buffer.writeString(content);
			}
		}, {
			key: "_getCharSize",
			value: function _getCharSize(byte) {
				return (0xE5000000 >> (byte >> 3 & 0x1e) & 3) + 1;
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.CharReader':
					case 'System.Char':
						return true;

					default:
						return false;
				}
			}
		}]);

		return CharReader;
	}(BaseReader);

	var DictionaryReader = function (_BaseReader) {
		_inherits(DictionaryReader, _BaseReader);

		var _super = _createSuper(DictionaryReader);

		function DictionaryReader(key, value) {
			var _this;

			_classCallCheck(this, DictionaryReader);

			if (key == undefined || value == undefined) throw new Error('Cannot create instance of DictionaryReader without Key and Value.');
			_this = _super.call(this);
			_this.key = key;
			_this.value = value;
			return _this;
		}

		_createClass(DictionaryReader, [{
			key: "read",
			value: function read(buffer, resolver) {
				var dictionary = {};
				var uint32Reader = new UInt32Reader();
				var size = uint32Reader.read(buffer);

				for (var i = 0; i < size; i++) {
					var key = this.key.isValueType() ? this.key.read(buffer) : resolver.read(buffer);
					var value = this.value.isValueType() ? this.value.read(buffer) : resolver.read(buffer);
					dictionary[key] = value;
				}

				return dictionary;
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				buffer.writeUInt32(Object.keys(content).length);

				for (var _i2 = 0, _Object$keys2 = Object.keys(content); _i2 < _Object$keys2.length; _i2++) {
					var key = _Object$keys2[_i2];
					this.key.write(buffer, key, this.key.isValueType() ? null : resolver);
					this.value.write(buffer, content[key], this.value.isValueType() ? null : resolver);
				}
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}, {
			key: "type",
			get: function get() {
				return "Dictionary<".concat(this.key.type, ",").concat(this.value.type, ">");
			}
		}, {
			key: "parseTypeList",
			value: function parseTypeList() {
				return [this.type].concat(this.key.parseTypeList(), this.value.parseTypeList());
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.DictionaryReader':
						return true;

					default:
						return false;
				}
			}
		}, {
			key: "hasSubType",
			value: function hasSubType() {
				return true;
			}
		}]);

		return DictionaryReader;
	}(BaseReader);

	var DoubleReader = function (_BaseReader) {
		_inherits(DoubleReader, _BaseReader);

		var _super = _createSuper(DoubleReader);

		function DoubleReader() {
			_classCallCheck(this, DoubleReader);

			return _super.apply(this, arguments);
		}

		_createClass(DoubleReader, [{
			key: "read",
			value: function read(buffer) {
				return buffer.readDouble();
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				buffer.writeDouble(content);
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.DoubleReader':
					case 'System.Double':
						return true;

					default:
						return false;
				}
			}
		}]);

		return DoubleReader;
	}(BaseReader);

	var EffectReader = function (_BaseReader) {
		_inherits(EffectReader, _BaseReader);

		var _super = _createSuper(EffectReader);

		function EffectReader() {
			_classCallCheck(this, EffectReader);

			return _super.apply(this, arguments);
		}

		_createClass(EffectReader, [{
			key: "read",
			value: function read(buffer) {
				var uint32Reader = new UInt32Reader();
				var size = uint32Reader.read(buffer);
				var bytecode = buffer.read(size);
				return {
					export: {
						type: this.type,
						data: bytecode
					}
				};
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				var data = content.export.data;
				var uint32Reader = new UInt32Reader();
				uint32Reader.write(buffer, data.byteLength, null);
				buffer.concat(data);
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.EffectReader':
					case 'Microsoft.Xna.Framework.Graphics.Effect':
						return true;

					default:
						return false;
				}
			}
		}]);

		return EffectReader;
	}(BaseReader);

	var Int32Reader = function (_BaseReader) {
		_inherits(Int32Reader, _BaseReader);

		var _super = _createSuper(Int32Reader);

		function Int32Reader() {
			_classCallCheck(this, Int32Reader);

			return _super.apply(this, arguments);
		}

		_createClass(Int32Reader, [{
			key: "read",
			value: function read(buffer) {
				return buffer.readInt32();
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				buffer.writeInt32(content);
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.Int32Reader':
					case 'System.Int32':
						return true;

					default:
						return false;
				}
			}
		}]);

		return Int32Reader;
	}(BaseReader);

	var ListReader = function (_BaseReader) {
		_inherits(ListReader, _BaseReader);

		var _super = _createSuper(ListReader);

		function ListReader(reader) {
			var _this;

			_classCallCheck(this, ListReader);

			_this = _super.call(this);
			_this.reader = reader;
			return _this;
		}

		_createClass(ListReader, [{
			key: "read",
			value: function read(buffer, resolver) {
				var uint32Reader = new UInt32Reader();
				var size = uint32Reader.read(buffer);
				var list = [];

				for (var i = 0; i < size; i++) {
					var value = this.reader.isValueType() ? this.reader.read(buffer) : resolver.read(buffer);
					list.push(value);
				}

				return list;
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				var uint32Reader = new UInt32Reader();
				uint32Reader.write(buffer, content.length, null);

				var __keys = Object.keys(content);

				for (var __i = 0; __i < __keys.length; __i++) {
					var __key = __keys[__i],
							data = content[__key];
					this.reader.write(buffer, data, this.reader.isValueType() ? null : resolver);
				}
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}, {
			key: "type",
			get: function get() {
				return "List<".concat(this.reader.type, ">");
			}
		}, {
			key: "parseTypeList",
			value: function parseTypeList() {
				return [this.type].concat(this.reader.parseTypeList());
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.ListReader':
					case 'System.Collections.Generic.List':
						return true;

					default:
						return false;
				}
			}
		}, {
			key: "hasSubType",
			value: function hasSubType() {
				return true;
			}
		}]);

		return ListReader;
	}(BaseReader);

	var NullableReader = function (_BaseReader) {
		_inherits(NullableReader, _BaseReader);

		var _super = _createSuper(NullableReader);

		function NullableReader(reader) {
			var _this;

			_classCallCheck(this, NullableReader);

			_this = _super.call(this);
			_this.reader = reader;
			return _this;
		}

		_createClass(NullableReader, [{
			key: "read",
			value: function read(buffer) {
				var resolver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var booleanReader = new BooleanReader();
				var hasValue = buffer.peekByte(1);

				if (!hasValue) {
					booleanReader.read(buffer);
					return null;
				}

				if (resolver === null) {
					booleanReader.read(buffer);
					return this.reader.read(buffer);
				}

				return this.reader.isValueType() ? this.reader.read(buffer) : resolver.read(buffer);
			}
		}, {
			key: "write",
			value: function write(buffer) {
				var content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var resolver = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
				new BooleanReader();

				if (content === null) {
					buffer.writeByte(0);
					return;
				}

				if (resolver === null) buffer.writeByte(1);
				this.reader.write(buffer, content, this.reader.isValueType() ? null : resolver);
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}, {
			key: "type",
			get: function get() {
				return "Nullable<".concat(this.reader.type, ">");
			}
		}, {
			key: "parseTypeList",
			value: function parseTypeList() {
				var inBlock = this.reader.parseTypeList();
				return ["".concat(this.type, ":").concat(inBlock.length)].concat(inBlock);
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.NullableReader':
						return true;

					default:
						return false;
				}
			}
		}, {
			key: "hasSubType",
			value: function hasSubType() {
				return true;
			}
		}]);

		return NullableReader;
	}(BaseReader);

	var ReflectiveReader = function (_BaseReader) {
		_inherits(ReflectiveReader, _BaseReader);

		var _super = _createSuper(ReflectiveReader);

		function ReflectiveReader(reader) {
			var _this;

			_classCallCheck(this, ReflectiveReader);

			_this = _super.call(this);
			_this.reader = reader;
			return _this;
		}

		_createClass(ReflectiveReader, [{
			key: "read",
			value: function read(buffer, resolver) {
				var reflective = this.reader.read(buffer, resolver);
				return reflective;
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.reader.write(buffer, content, this.reader.isValueType() ? null : resolver);
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}, {
			key: "type",
			get: function get() {
				return "".concat(this.reader.type);
			}
		}, {
			key: "parseTypeList",
			value: function parseTypeList() {
				return [].concat(this.reader.parseTypeList());
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.ReflectiveReader':
						return true;

					default:
						return false;
				}
			}
		}, {
			key: "hasSubType",
			value: function hasSubType() {
				return true;
			}
		}]);

		return ReflectiveReader;
	}(BaseReader);

	var RectangleReader = function (_BaseReader) {
		_inherits(RectangleReader, _BaseReader);

		var _super = _createSuper(RectangleReader);

		function RectangleReader() {
			_classCallCheck(this, RectangleReader);

			return _super.apply(this, arguments);
		}

		_createClass(RectangleReader, [{
			key: "read",
			value: function read(buffer) {
				var int32Reader = new Int32Reader();
				var x = int32Reader.read(buffer);
				var y = int32Reader.read(buffer);
				var width = int32Reader.read(buffer);
				var height = int32Reader.read(buffer);
				return {
					x: x,
					y: y,
					width: width,
					height: height
				};
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				var int32Reader = new Int32Reader();
				int32Reader.write(buffer, content.x, null);
				int32Reader.write(buffer, content.y, null);
				int32Reader.write(buffer, content.width, null);
				int32Reader.write(buffer, content.height, null);
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.RectangleReader':
					case 'Microsoft.Xna.Framework.Rectangle':
						return true;

					default:
						return false;
				}
			}
		}]);

		return RectangleReader;
	}(BaseReader);

	var SingleReader = function (_BaseReader) {
		_inherits(SingleReader, _BaseReader);

		var _super = _createSuper(SingleReader);

		function SingleReader() {
			_classCallCheck(this, SingleReader);

			return _super.apply(this, arguments);
		}

		_createClass(SingleReader, [{
			key: "read",
			value: function read(buffer) {
				return buffer.readSingle();
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				buffer.writeSingle(content);
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.SingleReader':
					case 'System.Single':
						return true;

					default:
						return false;
				}
			}
		}]);

		return SingleReader;
	}(BaseReader);

	var kDxt1 = 1 << 0;
	var kDxt3 = 1 << 1;
	var kDxt5 = 1 << 2;
	var kColourIterativeClusterFit = 1 << 8;
	var kColourClusterFit = 1 << 3;
	var kColourRangeFit = 1 << 4;
	var kColourMetricPerceptual = 1 << 5;
	var kColourMetricUniform = 1 << 6;
	var kWeightColourByAlpha = 1 << 7;

	function Rot(theta) {
		var Mat = [[Math.cos(theta), Math.sin(theta)], [-Math.sin(theta), Math.cos(theta)]];
		return Mat;
	}

	function Rij(k, l, theta, N) {
		var Mat = Array(N);

		for (var i = 0; i < N; i++) {
			Mat[i] = Array(N);
		}

		for (var _i = 0; _i < N; _i++) {
			for (var j = 0; j < N; j++) {
				Mat[_i][j] = (_i === j) * 1.0;
			}
		}

		var Rotij = Rot(theta);
		Mat[k][k] = Rotij[0][0];
		Mat[l][l] = Rotij[1][1];
		Mat[k][l] = Rotij[0][1];
		Mat[l][k] = Rotij[1][0];
		return Mat;
	}

	function getTheta(aii, ajj, aij) {
		var th = 0.0;
		var denom = ajj - aii;

		if (Math.abs(denom) <= 1E-12) {
			th = Math.PI / 4.0;
		} else {
			th = 0.5 * Math.atan(2.0 * aij / (ajj - aii));
		}

		return th;
	}

	function getAij(Mij) {
		var N = Mij.length;
		var maxMij = 0.0;
		var maxIJ = [0, 1];

		for (var i = 0; i < N; i++) {
			for (var j = i + 1; j < N; j++) {
				if (Math.abs(maxMij) <= Math.abs(Mij[i][j])) {
					maxMij = Math.abs(Mij[i][j]);
					maxIJ = [i, j];
				}
			}
		}

		return [maxIJ, maxMij];
	}

	function unitary(U, H) {
		var N = U.length;
		var Mat = Array(N);

		for (var i = 0; i < N; i++) {
			Mat[i] = Array(N);
		}

		for (var _i2 = 0; _i2 < N; _i2++) {
			for (var j = 0; j < N; j++) {
				Mat[_i2][j] = 0;

				for (var k = 0; k < N; k++) {
					for (var l = 0; l < N; l++) {
						Mat[_i2][j] = Mat[_i2][j] + U[k][_i2] * H[k][l] * U[l][j];
					}
				}
			}
		}

		return Mat;
	}

	function AxB(A, B) {
		var N = A.length;
		var Mat = Array(N);

		for (var i = 0; i < N; i++) {
			Mat[i] = Array(N);
		}

		for (var _i3 = 0; _i3 < N; _i3++) {
			for (var j = 0; j < N; j++) {
				Mat[_i3][j] = 0;

				for (var k = 0; k < N; k++) {
					Mat[_i3][j] = Mat[_i3][j] + A[_i3][k] * B[k][j];
				}
			}
		}

		return Mat;
	}

	function eigens(Hij) {
		var convergence = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1E-7;
		var N = Hij.length;
		var Ei = Array(N);
		var e0 = Math.abs(convergence / N);
		var Sij = Array(N);

		for (var i = 0; i < N; i++) {
			Sij[i] = Array(N);
		}

		for (var _i4 = 0; _i4 < N; _i4++) {
			for (var j = 0; j < N; j++) {
				Sij[_i4][j] = (_i4 === j) * 1.0;
			}
		}

		var Vab = getAij(Hij);

		while (Math.abs(Vab[1]) >= Math.abs(e0)) {
			var _i5 = Vab[0][0];
			var _j = Vab[0][1];
			var psi = getTheta(Hij[_i5][_i5], Hij[_j][_j], Hij[_i5][_j]);
			var Gij = Rij(_i5, _j, psi, N);
			Hij = unitary(Gij, Hij);
			Sij = AxB(Sij, Gij);
			Vab = getAij(Hij);
		}

		for (var _i6 = 0; _i6 < N; _i6++) {
			Ei[_i6] = Hij[_i6][_i6];
		}

		return sorting(Ei, Sij);
	}

	function sorting(values, vectors) {
		var eigsCount = values.length;
		vectors.length;

		var pairs = __arrayMaker({
			length: eigsCount
		}, function (_, i) {
			var vector = vectors.map(function (v) {
				return v[i];
			});
			return {
				value: values[i],
				vec: vector
			};
		});

		pairs.sort(function (a, b) {
			return b.value - a.value;
		});
		var sortedValues = pairs.map(function (_ref) {
			var value = _ref.value;
			return value;
		});
		var sortedVectors = pairs.map(function (_ref2) {
			var vec = _ref2.vec;
			return vec;
		});
		return [sortedValues, sortedVectors];
	}

	function dominentPrincipalVector(matrix) {
		var _eigens = eigens(matrix),
				_eigens$ = _eigens[1],
				dominentVector = _eigens$[0];

		return dominentVector;
	}

	var Vec3 = function () {
		function Vec3() {
			var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
			var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
			var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : x;

			_classCallCheck(this, Vec3);

			this._values = [x, y, z];
		}

		_createClass(Vec3, [{
			key: "x",
			get: function get() {
				return this._values[0];
			},
			set: function set(value) {
				this._values[0] = value;
			}
		}, {
			key: "y",
			get: function get() {
				return this._values[1];
			},
			set: function set(value) {
				this._values[1] = value;
			}
		}, {
			key: "z",
			get: function get() {
				return this._values[2];
			},
			set: function set(value) {
				this._values[2] = value;
			}
		}, {
			key: "length",
			get: function get() {
				return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
			}
		}, {
			key: "lengthSq",
			get: function get() {
				return this.x * this.x + this.y * this.y + this.z * this.z;
			}
		}, {
			key: "normalized",
			get: function get() {
				if (this.length === 0) return null;
				return Vec3.multScalar(this, 1 / this.length);
			}
		}, {
			key: "colorInt",
			get: function get() {
				var floatToInt = function floatToInt(value) {
					var result = parseInt(value * 255 + 0.5);
					return Math.max(Math.min(result, 255), 0);
				};

				return this._values.map(floatToInt);
			}
		}, {
			key: "clone",
			value: function clone() {
				return new Vec3(this.x, this.y, this.z);
			}
		}, {
			key: "set",
			value: function set(x) {
				var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
				var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : x;
				this._values[0] = x;
				this._values[1] = y;
				this._values[2] = z;
				return this;
			}
		}, {
			key: "toVec4",
			value: function toVec4() {
				var w = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
				return new Vec4(this.x, this.y, this.z, w);
			}
		}, {
			key: "addVector",
			value: function addVector(v) {
				this._values[0] += v.x;
				this._values[1] += v.y;
				this._values[2] += v.z;
				return this;
			}
		}, {
			key: "addScaledVector",
			value: function addScaledVector(v, scalar) {
				this._values[0] += v.x * scalar;
				this._values[1] += v.y * scalar;
				this._values[2] += v.z * scalar;
				return this;
			}
		}, {
			key: "mult",
			value: function mult(scalar) {
				this._values[0] *= scalar;
				this._values[1] *= scalar;
				this._values[2] *= scalar;
				return this;
			}
		}, {
			key: "multVector",
			value: function multVector(vec) {
				this._values[0] *= vec.x;
				this._values[1] *= vec.y;
				this._values[2] *= vec.z;
				return this;
			}
		}, {
			key: "clamp",
			value: function clamp(min, max) {
				var clamper = function clamper(v) {
					return min > v ? min : max < v ? max : v;
				};

				this._values[0] = clamper(this._values[0]);
				this._values[1] = clamper(this._values[1]);
				this._values[2] = clamper(this._values[2]);
				return this;
			}
		}, {
			key: "clampGrid",
			value: function clampGrid() {
				var clamper = function clamper(v) {
					return 0 > v ? 0 : 1 < v ? 1 : v;
				};

				var gridClamper = function gridClamper(value, grid) {
					return __trunc(clamper(value) * grid + 0.5) / grid;
				};

				this._values[0] = gridClamper(this._values[0], 31);
				this._values[1] = gridClamper(this._values[1], 63);
				this._values[2] = gridClamper(this._values[2], 31);
				return this;
			}
		}, {
			key: "normalize",
			value: function normalize() {
				this._values[0] /= this.length;
				this._values[1] /= this.length;
				this._values[2] /= this.length;
				return this;
			}
		}, {
			key: "toString",
			value: function toString() {
				return "Vec3( ".concat(this._values.join(", "), " )");
			}
		}], [{
			key: "add",
			value: function add(a, b) {
				return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
			}
		}, {
			key: "sub",
			value: function sub(a, b) {
				return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
			}
		}, {
			key: "dot",
			value: function dot(a, b) {
				return a.x * b.x + a.y * b.y + a.z * b.z;
			}
		}, {
			key: "multScalar",
			value: function multScalar(a, scalar) {
				return new Vec3(a.x * scalar, a.y * scalar, a.z * scalar);
			}
		}, {
			key: "multVector",
			value: function multVector(a, b) {
				return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
			}
		}, {
			key: "interpolate",
			value: function interpolate(a, b, p) {
				var a_ = Vec3.multScalar(a, 1 - p);
				var b_ = Vec3.multScalar(b, p);
				return Vec3.add(a_, b_);
			}
		}]);

		return Vec3;
	}();

	var Vec4 = function () {
		function Vec4() {
			var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
			var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
			var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : x;
			var w = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : x;

			_classCallCheck(this, Vec4);

			this._values = [x, y, z, w];
		}

		_createClass(Vec4, [{
			key: "x",
			get: function get() {
				return this._values[0];
			},
			set: function set(value) {
				this._values[0] = value;
			}
		}, {
			key: "y",
			get: function get() {
				return this._values[1];
			},
			set: function set(value) {
				this._values[1] = value;
			}
		}, {
			key: "z",
			get: function get() {
				return this._values[2];
			},
			set: function set(value) {
				this._values[2] = value;
			}
		}, {
			key: "w",
			get: function get() {
				return this._values[3];
			},
			set: function set(value) {
				this._values[3] = value;
			}
		}, {
			key: "length",
			get: function get() {
				return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
			}
		}, {
			key: "lengthSq",
			get: function get() {
				return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
			}
		}, {
			key: "normalized",
			get: function get() {
				if (this.length === 0) return null;
				return Vec4.multScalar(this, 1 / this.length);
			}
		}, {
			key: "xyz",
			get: function get() {
				return new Vec3(this.x, this.y, this.z);
			}
		}, {
			key: "splatX",
			get: function get() {
				return new Vec4(this.x);
			}
		}, {
			key: "splatY",
			get: function get() {
				return new Vec4(this.y);
			}
		}, {
			key: "splatZ",
			get: function get() {
				return new Vec4(this.z);
			}
		}, {
			key: "splatW",
			get: function get() {
				return new Vec4(this.w);
			}
		}, {
			key: "clone",
			value: function clone() {
				return new Vec4(this.x, this.y, this.z, this.w);
			}
		}, {
			key: "set",
			value: function set(x) {
				var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
				var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : x;
				var w = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : x;
				this._values[0] = x;
				this._values[1] = y;
				this._values[2] = z;
				this._values[3] = w;
				return this;
			}
		}, {
			key: "toVec3",
			value: function toVec3() {
				return this.xyz;
			}
		}, {
			key: "addVector",
			value: function addVector(v) {
				this._values[0] += v.x;
				this._values[1] += v.y;
				this._values[2] += v.z;
				this._values[3] += v.w;
				return this;
			}
		}, {
			key: "addScaledVector",
			value: function addScaledVector(v, scalar) {
				this._values[0] += v.x * scalar;
				this._values[1] += v.y * scalar;
				this._values[2] += v.z * scalar;
				this._values[3] += v.w * scalar;
				return this;
			}
		}, {
			key: "subVector",
			value: function subVector(v) {
				this._values[0] -= v.x;
				this._values[1] -= v.y;
				this._values[2] -= v.z;
				this._values[3] -= v.w;
				return this;
			}
		}, {
			key: "mult",
			value: function mult(scalar) {
				this._values[0] *= scalar;
				this._values[1] *= scalar;
				this._values[2] *= scalar;
				this._values[3] *= scalar;
				return this;
			}
		}, {
			key: "multVector",
			value: function multVector(vec) {
				this._values[0] *= vec.x;
				this._values[1] *= vec.y;
				this._values[2] *= vec.z;
				this._values[3] *= vec.w;
				return this;
			}
		}, {
			key: "reciprocal",
			value: function reciprocal() {
				this._values[0] = 1 / this._values[0];
				this._values[1] = 1 / this._values[1];
				this._values[2] = 1 / this._values[2];
				this._values[3] = 1 / this._values[3];
				return this;
			}
		}, {
			key: "clamp",
			value: function clamp(min, max) {
				var clamper = function clamper(v) {
					return min > v ? min : max < v ? max : v;
				};

				this._values[0] = clamper(this._values[0]);
				this._values[1] = clamper(this._values[1]);
				this._values[2] = clamper(this._values[2]);
				this._values[3] = clamper(this._values[3]);
				return this;
			}
		}, {
			key: "clampGrid",
			value: function clampGrid() {
				var clamper = function clamper(v) {
					return 0 > v ? 0 : 1 < v ? 1 : v;
				};

				var gridClamper = function gridClamper(value, grid) {
					return __trunc(clamper(value) * grid + 0.5) / grid;
				};

				this._values[0] = gridClamper(this._values[0], 31);
				this._values[1] = gridClamper(this._values[1], 63);
				this._values[2] = gridClamper(this._values[2], 31);
				this._values[3] = clamper(this._values[3]);
				return this;
			}
		}, {
			key: "truncate",
			value: function truncate() {
				this._values[0] = __trunc(this._values[0]);
				this._values[1] = __trunc(this._values[1]);
				this._values[2] = __trunc(this._values[2]);
				this._values[3] = __trunc(this._values[3]);
				return this;
			}
		}, {
			key: "normalize",
			value: function normalize() {
				this._values[0] /= this.length;
				this._values[1] /= this.length;
				this._values[2] /= this.length;
				this._values[3] /= this.length;
				return this;
			}
		}, {
			key: "toString",
			value: function toString() {
				return "Vec4( ".concat(this._values.join(", "), " )");
			}
		}], [{
			key: "add",
			value: function add(a, b) {
				return new Vec4(a.x + b.x, a.y + b.y, a.z + b.z, a.w + b.w);
			}
		}, {
			key: "sub",
			value: function sub(a, b) {
				return new Vec4(a.x - b.x, a.y - b.y, a.z - b.z, a.w - b.w);
			}
		}, {
			key: "dot",
			value: function dot(a, b) {
				return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
			}
		}, {
			key: "multScalar",
			value: function multScalar(a, scalar) {
				return new Vec4(a.x * scalar, a.y * scalar, a.z * scalar, a.w * scalar);
			}
		}, {
			key: "multVector",
			value: function multVector(a, b) {
				return new Vec4(a.x * b.x, a.y * b.y, a.z * b.z, a.w * b.w);
			}
		}, {
			key: "interpolate",
			value: function interpolate(a, b, p) {
				var a_ = Vec4.multScalar(a, 1 - p);
				var b_ = Vec4.multScalar(b, p);
				return Vec4.add(a_, b_);
			}
		}, {
			key: "multiplyAdd",
			value: function multiplyAdd(a, b, c) {
				return new Vec4(a.x * b.x + c.x, a.y * b.y + c.y, a.z * b.z + c.z, a.w * b.w + c.w);
			}
		}, {
			key: "negativeMultiplySubtract",
			value: function negativeMultiplySubtract(a, b, c) {
				return new Vec4(c.x - a.x * b.x, c.y - a.y * b.y, c.z - a.z * b.z, c.w - a.w * b.w);
			}
		}, {
			key: "compareAnyLessThan",
			value: function compareAnyLessThan(left, right) {
				return left.x < right.x || left.y < right.y || left.z < right.z || left.w < right.w;
			}
		}]);

		return Vec4;
	}();

	function computeWeightedCovariance(values, weights) {
		var total = 0;
		var mean = values.reduce(function (sum, value, i) {
			total += weights[i];
			sum.addScaledVector(value, weights[i]);
			return sum;
		}, new Vec3(0));
		mean.mult(1 / total);
		var covariance = values.reduce(function (sum, value, i) {
			var weight = weights[i];
			var v = Vec3.sub(value, mean);
			sum[0][0] += v.x * v.x * weight;
			sum[0][1] += v.x * v.y * weight;
			sum[0][2] += v.x * v.z * weight;
			sum[1][1] += v.y * v.y * weight;
			sum[1][2] += v.y * v.z * weight;
			sum[2][2] += v.z * v.z * weight;
			return sum;
		}, [[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
		covariance[1][0] = covariance[0][1];
		covariance[2][0] = covariance[0][2];
		covariance[2][1] = covariance[1][2];
		return covariance;
	}

	function computePCA(values, weights) {
		var covariance = computeWeightedCovariance(values, weights);
		return _construct(Vec3, dominentPrincipalVector(covariance));
	}

	var lookup_5_3 = [[[0, 0, 0], [0, 0, 0]], [[0, 0, 1], [0, 0, 1]], [[0, 0, 2], [0, 0, 2]], [[0, 0, 3], [0, 1, 1]], [[0, 0, 4], [0, 1, 0]], [[1, 0, 3], [0, 1, 1]], [[1, 0, 2], [0, 1, 2]], [[1, 0, 1], [0, 2, 1]], [[1, 0, 0], [0, 2, 0]], [[1, 0, 1], [0, 2, 1]], [[1, 0, 2], [0, 2, 2]], [[1, 0, 3], [0, 3, 1]], [[1, 0, 4], [0, 3, 0]], [[2, 0, 3], [0, 3, 1]], [[2, 0, 2], [0, 3, 2]], [[2, 0, 1], [0, 4, 1]], [[2, 0, 0], [0, 4, 0]], [[2, 0, 1], [0, 4, 1]], [[2, 0, 2], [0, 4, 2]], [[2, 0, 3], [0, 5, 1]], [[2, 0, 4], [0, 5, 0]], [[3, 0, 3], [0, 5, 1]], [[3, 0, 2], [0, 5, 2]], [[3, 0, 1], [0, 6, 1]], [[3, 0, 0], [0, 6, 0]], [[3, 0, 1], [0, 6, 1]], [[3, 0, 2], [0, 6, 2]], [[3, 0, 3], [0, 7, 1]], [[3, 0, 4], [0, 7, 0]], [[4, 0, 4], [0, 7, 1]], [[4, 0, 3], [0, 7, 2]], [[4, 0, 2], [1, 7, 1]], [[4, 0, 1], [1, 7, 0]], [[4, 0, 0], [0, 8, 0]], [[4, 0, 1], [0, 8, 1]], [[4, 0, 2], [2, 7, 1]], [[4, 0, 3], [2, 7, 0]], [[4, 0, 4], [0, 9, 0]], [[5, 0, 3], [0, 9, 1]], [[5, 0, 2], [3, 7, 1]], [[5, 0, 1], [3, 7, 0]], [[5, 0, 0], [0, 10, 0]], [[5, 0, 1], [0, 10, 1]], [[5, 0, 2], [0, 10, 2]], [[5, 0, 3], [0, 11, 1]], [[5, 0, 4], [0, 11, 0]], [[6, 0, 3], [0, 11, 1]], [[6, 0, 2], [0, 11, 2]], [[6, 0, 1], [0, 12, 1]], [[6, 0, 0], [0, 12, 0]], [[6, 0, 1], [0, 12, 1]], [[6, 0, 2], [0, 12, 2]], [[6, 0, 3], [0, 13, 1]], [[6, 0, 4], [0, 13, 0]], [[7, 0, 3], [0, 13, 1]], [[7, 0, 2], [0, 13, 2]], [[7, 0, 1], [0, 14, 1]], [[7, 0, 0], [0, 14, 0]], [[7, 0, 1], [0, 14, 1]], [[7, 0, 2], [0, 14, 2]], [[7, 0, 3], [0, 15, 1]], [[7, 0, 4], [0, 15, 0]], [[8, 0, 4], [0, 15, 1]], [[8, 0, 3], [0, 15, 2]], [[8, 0, 2], [1, 15, 1]], [[8, 0, 1], [1, 15, 0]], [[8, 0, 0], [0, 16, 0]], [[8, 0, 1], [0, 16, 1]], [[8, 0, 2], [2, 15, 1]], [[8, 0, 3], [2, 15, 0]], [[8, 0, 4], [0, 17, 0]], [[9, 0, 3], [0, 17, 1]], [[9, 0, 2], [3, 15, 1]], [[9, 0, 1], [3, 15, 0]], [[9, 0, 0], [0, 18, 0]], [[9, 0, 1], [0, 18, 1]], [[9, 0, 2], [0, 18, 2]], [[9, 0, 3], [0, 19, 1]], [[9, 0, 4], [0, 19, 0]], [[10, 0, 3], [0, 19, 1]], [[10, 0, 2], [0, 19, 2]], [[10, 0, 1], [0, 20, 1]], [[10, 0, 0], [0, 20, 0]], [[10, 0, 1], [0, 20, 1]], [[10, 0, 2], [0, 20, 2]], [[10, 0, 3], [0, 21, 1]], [[10, 0, 4], [0, 21, 0]], [[11, 0, 3], [0, 21, 1]], [[11, 0, 2], [0, 21, 2]], [[11, 0, 1], [0, 22, 1]], [[11, 0, 0], [0, 22, 0]], [[11, 0, 1], [0, 22, 1]], [[11, 0, 2], [0, 22, 2]], [[11, 0, 3], [0, 23, 1]], [[11, 0, 4], [0, 23, 0]], [[12, 0, 4], [0, 23, 1]], [[12, 0, 3], [0, 23, 2]], [[12, 0, 2], [1, 23, 1]], [[12, 0, 1], [1, 23, 0]], [[12, 0, 0], [0, 24, 0]], [[12, 0, 1], [0, 24, 1]], [[12, 0, 2], [2, 23, 1]], [[12, 0, 3], [2, 23, 0]], [[12, 0, 4], [0, 25, 0]], [[13, 0, 3], [0, 25, 1]], [[13, 0, 2], [3, 23, 1]], [[13, 0, 1], [3, 23, 0]], [[13, 0, 0], [0, 26, 0]], [[13, 0, 1], [0, 26, 1]], [[13, 0, 2], [0, 26, 2]], [[13, 0, 3], [0, 27, 1]], [[13, 0, 4], [0, 27, 0]], [[14, 0, 3], [0, 27, 1]], [[14, 0, 2], [0, 27, 2]], [[14, 0, 1], [0, 28, 1]], [[14, 0, 0], [0, 28, 0]], [[14, 0, 1], [0, 28, 1]], [[14, 0, 2], [0, 28, 2]], [[14, 0, 3], [0, 29, 1]], [[14, 0, 4], [0, 29, 0]], [[15, 0, 3], [0, 29, 1]], [[15, 0, 2], [0, 29, 2]], [[15, 0, 1], [0, 30, 1]], [[15, 0, 0], [0, 30, 0]], [[15, 0, 1], [0, 30, 1]], [[15, 0, 2], [0, 30, 2]], [[15, 0, 3], [0, 31, 1]], [[15, 0, 4], [0, 31, 0]], [[16, 0, 4], [0, 31, 1]], [[16, 0, 3], [0, 31, 2]], [[16, 0, 2], [1, 31, 1]], [[16, 0, 1], [1, 31, 0]], [[16, 0, 0], [4, 28, 0]], [[16, 0, 1], [4, 28, 1]], [[16, 0, 2], [2, 31, 1]], [[16, 0, 3], [2, 31, 0]], [[16, 0, 4], [4, 29, 0]], [[17, 0, 3], [4, 29, 1]], [[17, 0, 2], [3, 31, 1]], [[17, 0, 1], [3, 31, 0]], [[17, 0, 0], [4, 30, 0]], [[17, 0, 1], [4, 30, 1]], [[17, 0, 2], [4, 30, 2]], [[17, 0, 3], [4, 31, 1]], [[17, 0, 4], [4, 31, 0]], [[18, 0, 3], [4, 31, 1]], [[18, 0, 2], [4, 31, 2]], [[18, 0, 1], [5, 31, 1]], [[18, 0, 0], [5, 31, 0]], [[18, 0, 1], [5, 31, 1]], [[18, 0, 2], [5, 31, 2]], [[18, 0, 3], [6, 31, 1]], [[18, 0, 4], [6, 31, 0]], [[19, 0, 3], [6, 31, 1]], [[19, 0, 2], [6, 31, 2]], [[19, 0, 1], [7, 31, 1]], [[19, 0, 0], [7, 31, 0]], [[19, 0, 1], [7, 31, 1]], [[19, 0, 2], [7, 31, 2]], [[19, 0, 3], [8, 31, 1]], [[19, 0, 4], [8, 31, 0]], [[20, 0, 4], [8, 31, 1]], [[20, 0, 3], [8, 31, 2]], [[20, 0, 2], [9, 31, 1]], [[20, 0, 1], [9, 31, 0]], [[20, 0, 0], [12, 28, 0]], [[20, 0, 1], [12, 28, 1]], [[20, 0, 2], [10, 31, 1]], [[20, 0, 3], [10, 31, 0]], [[20, 0, 4], [12, 29, 0]], [[21, 0, 3], [12, 29, 1]], [[21, 0, 2], [11, 31, 1]], [[21, 0, 1], [11, 31, 0]], [[21, 0, 0], [12, 30, 0]], [[21, 0, 1], [12, 30, 1]], [[21, 0, 2], [12, 30, 2]], [[21, 0, 3], [12, 31, 1]], [[21, 0, 4], [12, 31, 0]], [[22, 0, 3], [12, 31, 1]], [[22, 0, 2], [12, 31, 2]], [[22, 0, 1], [13, 31, 1]], [[22, 0, 0], [13, 31, 0]], [[22, 0, 1], [13, 31, 1]], [[22, 0, 2], [13, 31, 2]], [[22, 0, 3], [14, 31, 1]], [[22, 0, 4], [14, 31, 0]], [[23, 0, 3], [14, 31, 1]], [[23, 0, 2], [14, 31, 2]], [[23, 0, 1], [15, 31, 1]], [[23, 0, 0], [15, 31, 0]], [[23, 0, 1], [15, 31, 1]], [[23, 0, 2], [15, 31, 2]], [[23, 0, 3], [16, 31, 1]], [[23, 0, 4], [16, 31, 0]], [[24, 0, 4], [16, 31, 1]], [[24, 0, 3], [16, 31, 2]], [[24, 0, 2], [17, 31, 1]], [[24, 0, 1], [17, 31, 0]], [[24, 0, 0], [20, 28, 0]], [[24, 0, 1], [20, 28, 1]], [[24, 0, 2], [18, 31, 1]], [[24, 0, 3], [18, 31, 0]], [[24, 0, 4], [20, 29, 0]], [[25, 0, 3], [20, 29, 1]], [[25, 0, 2], [19, 31, 1]], [[25, 0, 1], [19, 31, 0]], [[25, 0, 0], [20, 30, 0]], [[25, 0, 1], [20, 30, 1]], [[25, 0, 2], [20, 30, 2]], [[25, 0, 3], [20, 31, 1]], [[25, 0, 4], [20, 31, 0]], [[26, 0, 3], [20, 31, 1]], [[26, 0, 2], [20, 31, 2]], [[26, 0, 1], [21, 31, 1]], [[26, 0, 0], [21, 31, 0]], [[26, 0, 1], [21, 31, 1]], [[26, 0, 2], [21, 31, 2]], [[26, 0, 3], [22, 31, 1]], [[26, 0, 4], [22, 31, 0]], [[27, 0, 3], [22, 31, 1]], [[27, 0, 2], [22, 31, 2]], [[27, 0, 1], [23, 31, 1]], [[27, 0, 0], [23, 31, 0]], [[27, 0, 1], [23, 31, 1]], [[27, 0, 2], [23, 31, 2]], [[27, 0, 3], [24, 31, 1]], [[27, 0, 4], [24, 31, 0]], [[28, 0, 4], [24, 31, 1]], [[28, 0, 3], [24, 31, 2]], [[28, 0, 2], [25, 31, 1]], [[28, 0, 1], [25, 31, 0]], [[28, 0, 0], [28, 28, 0]], [[28, 0, 1], [28, 28, 1]], [[28, 0, 2], [26, 31, 1]], [[28, 0, 3], [26, 31, 0]], [[28, 0, 4], [28, 29, 0]], [[29, 0, 3], [28, 29, 1]], [[29, 0, 2], [27, 31, 1]], [[29, 0, 1], [27, 31, 0]], [[29, 0, 0], [28, 30, 0]], [[29, 0, 1], [28, 30, 1]], [[29, 0, 2], [28, 30, 2]], [[29, 0, 3], [28, 31, 1]], [[29, 0, 4], [28, 31, 0]], [[30, 0, 3], [28, 31, 1]], [[30, 0, 2], [28, 31, 2]], [[30, 0, 1], [29, 31, 1]], [[30, 0, 0], [29, 31, 0]], [[30, 0, 1], [29, 31, 1]], [[30, 0, 2], [29, 31, 2]], [[30, 0, 3], [30, 31, 1]], [[30, 0, 4], [30, 31, 0]], [[31, 0, 3], [30, 31, 1]], [[31, 0, 2], [30, 31, 2]], [[31, 0, 1], [31, 31, 1]], [[31, 0, 0], [31, 31, 0]]];
	var lookup_6_3 = [[[0, 0, 0], [0, 0, 0]], [[0, 0, 1], [0, 1, 1]], [[0, 0, 2], [0, 1, 0]], [[1, 0, 1], [0, 2, 1]], [[1, 0, 0], [0, 2, 0]], [[1, 0, 1], [0, 3, 1]], [[1, 0, 2], [0, 3, 0]], [[2, 0, 1], [0, 4, 1]], [[2, 0, 0], [0, 4, 0]], [[2, 0, 1], [0, 5, 1]], [[2, 0, 2], [0, 5, 0]], [[3, 0, 1], [0, 6, 1]], [[3, 0, 0], [0, 6, 0]], [[3, 0, 1], [0, 7, 1]], [[3, 0, 2], [0, 7, 0]], [[4, 0, 1], [0, 8, 1]], [[4, 0, 0], [0, 8, 0]], [[4, 0, 1], [0, 9, 1]], [[4, 0, 2], [0, 9, 0]], [[5, 0, 1], [0, 10, 1]], [[5, 0, 0], [0, 10, 0]], [[5, 0, 1], [0, 11, 1]], [[5, 0, 2], [0, 11, 0]], [[6, 0, 1], [0, 12, 1]], [[6, 0, 0], [0, 12, 0]], [[6, 0, 1], [0, 13, 1]], [[6, 0, 2], [0, 13, 0]], [[7, 0, 1], [0, 14, 1]], [[7, 0, 0], [0, 14, 0]], [[7, 0, 1], [0, 15, 1]], [[7, 0, 2], [0, 15, 0]], [[8, 0, 1], [0, 16, 1]], [[8, 0, 0], [0, 16, 0]], [[8, 0, 1], [0, 17, 1]], [[8, 0, 2], [0, 17, 0]], [[9, 0, 1], [0, 18, 1]], [[9, 0, 0], [0, 18, 0]], [[9, 0, 1], [0, 19, 1]], [[9, 0, 2], [0, 19, 0]], [[10, 0, 1], [0, 20, 1]], [[10, 0, 0], [0, 20, 0]], [[10, 0, 1], [0, 21, 1]], [[10, 0, 2], [0, 21, 0]], [[11, 0, 1], [0, 22, 1]], [[11, 0, 0], [0, 22, 0]], [[11, 0, 1], [0, 23, 1]], [[11, 0, 2], [0, 23, 0]], [[12, 0, 1], [0, 24, 1]], [[12, 0, 0], [0, 24, 0]], [[12, 0, 1], [0, 25, 1]], [[12, 0, 2], [0, 25, 0]], [[13, 0, 1], [0, 26, 1]], [[13, 0, 0], [0, 26, 0]], [[13, 0, 1], [0, 27, 1]], [[13, 0, 2], [0, 27, 0]], [[14, 0, 1], [0, 28, 1]], [[14, 0, 0], [0, 28, 0]], [[14, 0, 1], [0, 29, 1]], [[14, 0, 2], [0, 29, 0]], [[15, 0, 1], [0, 30, 1]], [[15, 0, 0], [0, 30, 0]], [[15, 0, 1], [0, 31, 1]], [[15, 0, 2], [0, 31, 0]], [[16, 0, 2], [1, 31, 1]], [[16, 0, 1], [1, 31, 0]], [[16, 0, 0], [0, 32, 0]], [[16, 0, 1], [2, 31, 0]], [[16, 0, 2], [0, 33, 0]], [[17, 0, 1], [3, 31, 0]], [[17, 0, 0], [0, 34, 0]], [[17, 0, 1], [4, 31, 0]], [[17, 0, 2], [0, 35, 0]], [[18, 0, 1], [5, 31, 0]], [[18, 0, 0], [0, 36, 0]], [[18, 0, 1], [6, 31, 0]], [[18, 0, 2], [0, 37, 0]], [[19, 0, 1], [7, 31, 0]], [[19, 0, 0], [0, 38, 0]], [[19, 0, 1], [8, 31, 0]], [[19, 0, 2], [0, 39, 0]], [[20, 0, 1], [9, 31, 0]], [[20, 0, 0], [0, 40, 0]], [[20, 0, 1], [10, 31, 0]], [[20, 0, 2], [0, 41, 0]], [[21, 0, 1], [11, 31, 0]], [[21, 0, 0], [0, 42, 0]], [[21, 0, 1], [12, 31, 0]], [[21, 0, 2], [0, 43, 0]], [[22, 0, 1], [13, 31, 0]], [[22, 0, 0], [0, 44, 0]], [[22, 0, 1], [14, 31, 0]], [[22, 0, 2], [0, 45, 0]], [[23, 0, 1], [15, 31, 0]], [[23, 0, 0], [0, 46, 0]], [[23, 0, 1], [0, 47, 1]], [[23, 0, 2], [0, 47, 0]], [[24, 0, 1], [0, 48, 1]], [[24, 0, 0], [0, 48, 0]], [[24, 0, 1], [0, 49, 1]], [[24, 0, 2], [0, 49, 0]], [[25, 0, 1], [0, 50, 1]], [[25, 0, 0], [0, 50, 0]], [[25, 0, 1], [0, 51, 1]], [[25, 0, 2], [0, 51, 0]], [[26, 0, 1], [0, 52, 1]], [[26, 0, 0], [0, 52, 0]], [[26, 0, 1], [0, 53, 1]], [[26, 0, 2], [0, 53, 0]], [[27, 0, 1], [0, 54, 1]], [[27, 0, 0], [0, 54, 0]], [[27, 0, 1], [0, 55, 1]], [[27, 0, 2], [0, 55, 0]], [[28, 0, 1], [0, 56, 1]], [[28, 0, 0], [0, 56, 0]], [[28, 0, 1], [0, 57, 1]], [[28, 0, 2], [0, 57, 0]], [[29, 0, 1], [0, 58, 1]], [[29, 0, 0], [0, 58, 0]], [[29, 0, 1], [0, 59, 1]], [[29, 0, 2], [0, 59, 0]], [[30, 0, 1], [0, 60, 1]], [[30, 0, 0], [0, 60, 0]], [[30, 0, 1], [0, 61, 1]], [[30, 0, 2], [0, 61, 0]], [[31, 0, 1], [0, 62, 1]], [[31, 0, 0], [0, 62, 0]], [[31, 0, 1], [0, 63, 1]], [[31, 0, 2], [0, 63, 0]], [[32, 0, 2], [1, 63, 1]], [[32, 0, 1], [1, 63, 0]], [[32, 0, 0], [16, 48, 0]], [[32, 0, 1], [2, 63, 0]], [[32, 0, 2], [16, 49, 0]], [[33, 0, 1], [3, 63, 0]], [[33, 0, 0], [16, 50, 0]], [[33, 0, 1], [4, 63, 0]], [[33, 0, 2], [16, 51, 0]], [[34, 0, 1], [5, 63, 0]], [[34, 0, 0], [16, 52, 0]], [[34, 0, 1], [6, 63, 0]], [[34, 0, 2], [16, 53, 0]], [[35, 0, 1], [7, 63, 0]], [[35, 0, 0], [16, 54, 0]], [[35, 0, 1], [8, 63, 0]], [[35, 0, 2], [16, 55, 0]], [[36, 0, 1], [9, 63, 0]], [[36, 0, 0], [16, 56, 0]], [[36, 0, 1], [10, 63, 0]], [[36, 0, 2], [16, 57, 0]], [[37, 0, 1], [11, 63, 0]], [[37, 0, 0], [16, 58, 0]], [[37, 0, 1], [12, 63, 0]], [[37, 0, 2], [16, 59, 0]], [[38, 0, 1], [13, 63, 0]], [[38, 0, 0], [16, 60, 0]], [[38, 0, 1], [14, 63, 0]], [[38, 0, 2], [16, 61, 0]], [[39, 0, 1], [15, 63, 0]], [[39, 0, 0], [16, 62, 0]], [[39, 0, 1], [16, 63, 1]], [[39, 0, 2], [16, 63, 0]], [[40, 0, 1], [17, 63, 1]], [[40, 0, 0], [17, 63, 0]], [[40, 0, 1], [18, 63, 1]], [[40, 0, 2], [18, 63, 0]], [[41, 0, 1], [19, 63, 1]], [[41, 0, 0], [19, 63, 0]], [[41, 0, 1], [20, 63, 1]], [[41, 0, 2], [20, 63, 0]], [[42, 0, 1], [21, 63, 1]], [[42, 0, 0], [21, 63, 0]], [[42, 0, 1], [22, 63, 1]], [[42, 0, 2], [22, 63, 0]], [[43, 0, 1], [23, 63, 1]], [[43, 0, 0], [23, 63, 0]], [[43, 0, 1], [24, 63, 1]], [[43, 0, 2], [24, 63, 0]], [[44, 0, 1], [25, 63, 1]], [[44, 0, 0], [25, 63, 0]], [[44, 0, 1], [26, 63, 1]], [[44, 0, 2], [26, 63, 0]], [[45, 0, 1], [27, 63, 1]], [[45, 0, 0], [27, 63, 0]], [[45, 0, 1], [28, 63, 1]], [[45, 0, 2], [28, 63, 0]], [[46, 0, 1], [29, 63, 1]], [[46, 0, 0], [29, 63, 0]], [[46, 0, 1], [30, 63, 1]], [[46, 0, 2], [30, 63, 0]], [[47, 0, 1], [31, 63, 1]], [[47, 0, 0], [31, 63, 0]], [[47, 0, 1], [32, 63, 1]], [[47, 0, 2], [32, 63, 0]], [[48, 0, 2], [33, 63, 1]], [[48, 0, 1], [33, 63, 0]], [[48, 0, 0], [48, 48, 0]], [[48, 0, 1], [34, 63, 0]], [[48, 0, 2], [48, 49, 0]], [[49, 0, 1], [35, 63, 0]], [[49, 0, 0], [48, 50, 0]], [[49, 0, 1], [36, 63, 0]], [[49, 0, 2], [48, 51, 0]], [[50, 0, 1], [37, 63, 0]], [[50, 0, 0], [48, 52, 0]], [[50, 0, 1], [38, 63, 0]], [[50, 0, 2], [48, 53, 0]], [[51, 0, 1], [39, 63, 0]], [[51, 0, 0], [48, 54, 0]], [[51, 0, 1], [40, 63, 0]], [[51, 0, 2], [48, 55, 0]], [[52, 0, 1], [41, 63, 0]], [[52, 0, 0], [48, 56, 0]], [[52, 0, 1], [42, 63, 0]], [[52, 0, 2], [48, 57, 0]], [[53, 0, 1], [43, 63, 0]], [[53, 0, 0], [48, 58, 0]], [[53, 0, 1], [44, 63, 0]], [[53, 0, 2], [48, 59, 0]], [[54, 0, 1], [45, 63, 0]], [[54, 0, 0], [48, 60, 0]], [[54, 0, 1], [46, 63, 0]], [[54, 0, 2], [48, 61, 0]], [[55, 0, 1], [47, 63, 0]], [[55, 0, 0], [48, 62, 0]], [[55, 0, 1], [48, 63, 1]], [[55, 0, 2], [48, 63, 0]], [[56, 0, 1], [49, 63, 1]], [[56, 0, 0], [49, 63, 0]], [[56, 0, 1], [50, 63, 1]], [[56, 0, 2], [50, 63, 0]], [[57, 0, 1], [51, 63, 1]], [[57, 0, 0], [51, 63, 0]], [[57, 0, 1], [52, 63, 1]], [[57, 0, 2], [52, 63, 0]], [[58, 0, 1], [53, 63, 1]], [[58, 0, 0], [53, 63, 0]], [[58, 0, 1], [54, 63, 1]], [[58, 0, 2], [54, 63, 0]], [[59, 0, 1], [55, 63, 1]], [[59, 0, 0], [55, 63, 0]], [[59, 0, 1], [56, 63, 1]], [[59, 0, 2], [56, 63, 0]], [[60, 0, 1], [57, 63, 1]], [[60, 0, 0], [57, 63, 0]], [[60, 0, 1], [58, 63, 1]], [[60, 0, 2], [58, 63, 0]], [[61, 0, 1], [59, 63, 1]], [[61, 0, 0], [59, 63, 0]], [[61, 0, 1], [60, 63, 1]], [[61, 0, 2], [60, 63, 0]], [[62, 0, 1], [61, 63, 1]], [[62, 0, 0], [61, 63, 0]], [[62, 0, 1], [62, 63, 1]], [[62, 0, 2], [62, 63, 0]], [[63, 0, 1], [63, 63, 1]], [[63, 0, 0], [63, 63, 0]]];
	var lookup_5_4 = [[[0, 0, 0], [0, 0, 0]], [[0, 0, 1], [0, 1, 1]], [[0, 0, 2], [0, 1, 0]], [[0, 0, 3], [0, 1, 1]], [[0, 0, 4], [0, 2, 1]], [[1, 0, 3], [0, 2, 0]], [[1, 0, 2], [0, 2, 1]], [[1, 0, 1], [0, 3, 1]], [[1, 0, 0], [0, 3, 0]], [[1, 0, 1], [1, 2, 1]], [[1, 0, 2], [1, 2, 0]], [[1, 0, 3], [0, 4, 0]], [[1, 0, 4], [0, 5, 1]], [[2, 0, 3], [0, 5, 0]], [[2, 0, 2], [0, 5, 1]], [[2, 0, 1], [0, 6, 1]], [[2, 0, 0], [0, 6, 0]], [[2, 0, 1], [2, 3, 1]], [[2, 0, 2], [2, 3, 0]], [[2, 0, 3], [0, 7, 0]], [[2, 0, 4], [1, 6, 1]], [[3, 0, 3], [1, 6, 0]], [[3, 0, 2], [0, 8, 0]], [[3, 0, 1], [0, 9, 1]], [[3, 0, 0], [0, 9, 0]], [[3, 0, 1], [0, 9, 1]], [[3, 0, 2], [0, 10, 1]], [[3, 0, 3], [0, 10, 0]], [[3, 0, 4], [2, 7, 1]], [[4, 0, 4], [2, 7, 0]], [[4, 0, 3], [0, 11, 0]], [[4, 0, 2], [1, 10, 1]], [[4, 0, 1], [1, 10, 0]], [[4, 0, 0], [0, 12, 0]], [[4, 0, 1], [0, 13, 1]], [[4, 0, 2], [0, 13, 0]], [[4, 0, 3], [0, 13, 1]], [[4, 0, 4], [0, 14, 1]], [[5, 0, 3], [0, 14, 0]], [[5, 0, 2], [2, 11, 1]], [[5, 0, 1], [2, 11, 0]], [[5, 0, 0], [0, 15, 0]], [[5, 0, 1], [1, 14, 1]], [[5, 0, 2], [1, 14, 0]], [[5, 0, 3], [0, 16, 0]], [[5, 0, 4], [0, 17, 1]], [[6, 0, 3], [0, 17, 0]], [[6, 0, 2], [0, 17, 1]], [[6, 0, 1], [0, 18, 1]], [[6, 0, 0], [0, 18, 0]], [[6, 0, 1], [2, 15, 1]], [[6, 0, 2], [2, 15, 0]], [[6, 0, 3], [0, 19, 0]], [[6, 0, 4], [1, 18, 1]], [[7, 0, 3], [1, 18, 0]], [[7, 0, 2], [0, 20, 0]], [[7, 0, 1], [0, 21, 1]], [[7, 0, 0], [0, 21, 0]], [[7, 0, 1], [0, 21, 1]], [[7, 0, 2], [0, 22, 1]], [[7, 0, 3], [0, 22, 0]], [[7, 0, 4], [2, 19, 1]], [[8, 0, 4], [2, 19, 0]], [[8, 0, 3], [0, 23, 0]], [[8, 0, 2], [1, 22, 1]], [[8, 0, 1], [1, 22, 0]], [[8, 0, 0], [0, 24, 0]], [[8, 0, 1], [0, 25, 1]], [[8, 0, 2], [0, 25, 0]], [[8, 0, 3], [0, 25, 1]], [[8, 0, 4], [0, 26, 1]], [[9, 0, 3], [0, 26, 0]], [[9, 0, 2], [2, 23, 1]], [[9, 0, 1], [2, 23, 0]], [[9, 0, 0], [0, 27, 0]], [[9, 0, 1], [1, 26, 1]], [[9, 0, 2], [1, 26, 0]], [[9, 0, 3], [0, 28, 0]], [[9, 0, 4], [0, 29, 1]], [[10, 0, 3], [0, 29, 0]], [[10, 0, 2], [0, 29, 1]], [[10, 0, 1], [0, 30, 1]], [[10, 0, 0], [0, 30, 0]], [[10, 0, 1], [2, 27, 1]], [[10, 0, 2], [2, 27, 0]], [[10, 0, 3], [0, 31, 0]], [[10, 0, 4], [1, 30, 1]], [[11, 0, 3], [1, 30, 0]], [[11, 0, 2], [4, 24, 0]], [[11, 0, 1], [1, 31, 1]], [[11, 0, 0], [1, 31, 0]], [[11, 0, 1], [1, 31, 1]], [[11, 0, 2], [2, 30, 1]], [[11, 0, 3], [2, 30, 0]], [[11, 0, 4], [2, 31, 1]], [[12, 0, 4], [2, 31, 0]], [[12, 0, 3], [4, 27, 0]], [[12, 0, 2], [3, 30, 1]], [[12, 0, 1], [3, 30, 0]], [[12, 0, 0], [4, 28, 0]], [[12, 0, 1], [3, 31, 1]], [[12, 0, 2], [3, 31, 0]], [[12, 0, 3], [3, 31, 1]], [[12, 0, 4], [4, 30, 1]], [[13, 0, 3], [4, 30, 0]], [[13, 0, 2], [6, 27, 1]], [[13, 0, 1], [6, 27, 0]], [[13, 0, 0], [4, 31, 0]], [[13, 0, 1], [5, 30, 1]], [[13, 0, 2], [5, 30, 0]], [[13, 0, 3], [8, 24, 0]], [[13, 0, 4], [5, 31, 1]], [[14, 0, 3], [5, 31, 0]], [[14, 0, 2], [5, 31, 1]], [[14, 0, 1], [6, 30, 1]], [[14, 0, 0], [6, 30, 0]], [[14, 0, 1], [6, 31, 1]], [[14, 0, 2], [6, 31, 0]], [[14, 0, 3], [8, 27, 0]], [[14, 0, 4], [7, 30, 1]], [[15, 0, 3], [7, 30, 0]], [[15, 0, 2], [8, 28, 0]], [[15, 0, 1], [7, 31, 1]], [[15, 0, 0], [7, 31, 0]], [[15, 0, 1], [7, 31, 1]], [[15, 0, 2], [8, 30, 1]], [[15, 0, 3], [8, 30, 0]], [[15, 0, 4], [10, 27, 1]], [[16, 0, 4], [10, 27, 0]], [[16, 0, 3], [8, 31, 0]], [[16, 0, 2], [9, 30, 1]], [[16, 0, 1], [9, 30, 0]], [[16, 0, 0], [12, 24, 0]], [[16, 0, 1], [9, 31, 1]], [[16, 0, 2], [9, 31, 0]], [[16, 0, 3], [9, 31, 1]], [[16, 0, 4], [10, 30, 1]], [[17, 0, 3], [10, 30, 0]], [[17, 0, 2], [10, 31, 1]], [[17, 0, 1], [10, 31, 0]], [[17, 0, 0], [12, 27, 0]], [[17, 0, 1], [11, 30, 1]], [[17, 0, 2], [11, 30, 0]], [[17, 0, 3], [12, 28, 0]], [[17, 0, 4], [11, 31, 1]], [[18, 0, 3], [11, 31, 0]], [[18, 0, 2], [11, 31, 1]], [[18, 0, 1], [12, 30, 1]], [[18, 0, 0], [12, 30, 0]], [[18, 0, 1], [14, 27, 1]], [[18, 0, 2], [14, 27, 0]], [[18, 0, 3], [12, 31, 0]], [[18, 0, 4], [13, 30, 1]], [[19, 0, 3], [13, 30, 0]], [[19, 0, 2], [16, 24, 0]], [[19, 0, 1], [13, 31, 1]], [[19, 0, 0], [13, 31, 0]], [[19, 0, 1], [13, 31, 1]], [[19, 0, 2], [14, 30, 1]], [[19, 0, 3], [14, 30, 0]], [[19, 0, 4], [14, 31, 1]], [[20, 0, 4], [14, 31, 0]], [[20, 0, 3], [16, 27, 0]], [[20, 0, 2], [15, 30, 1]], [[20, 0, 1], [15, 30, 0]], [[20, 0, 0], [16, 28, 0]], [[20, 0, 1], [15, 31, 1]], [[20, 0, 2], [15, 31, 0]], [[20, 0, 3], [15, 31, 1]], [[20, 0, 4], [16, 30, 1]], [[21, 0, 3], [16, 30, 0]], [[21, 0, 2], [18, 27, 1]], [[21, 0, 1], [18, 27, 0]], [[21, 0, 0], [16, 31, 0]], [[21, 0, 1], [17, 30, 1]], [[21, 0, 2], [17, 30, 0]], [[21, 0, 3], [20, 24, 0]], [[21, 0, 4], [17, 31, 1]], [[22, 0, 3], [17, 31, 0]], [[22, 0, 2], [17, 31, 1]], [[22, 0, 1], [18, 30, 1]], [[22, 0, 0], [18, 30, 0]], [[22, 0, 1], [18, 31, 1]], [[22, 0, 2], [18, 31, 0]], [[22, 0, 3], [20, 27, 0]], [[22, 0, 4], [19, 30, 1]], [[23, 0, 3], [19, 30, 0]], [[23, 0, 2], [20, 28, 0]], [[23, 0, 1], [19, 31, 1]], [[23, 0, 0], [19, 31, 0]], [[23, 0, 1], [19, 31, 1]], [[23, 0, 2], [20, 30, 1]], [[23, 0, 3], [20, 30, 0]], [[23, 0, 4], [22, 27, 1]], [[24, 0, 4], [22, 27, 0]], [[24, 0, 3], [20, 31, 0]], [[24, 0, 2], [21, 30, 1]], [[24, 0, 1], [21, 30, 0]], [[24, 0, 0], [24, 24, 0]], [[24, 0, 1], [21, 31, 1]], [[24, 0, 2], [21, 31, 0]], [[24, 0, 3], [21, 31, 1]], [[24, 0, 4], [22, 30, 1]], [[25, 0, 3], [22, 30, 0]], [[25, 0, 2], [22, 31, 1]], [[25, 0, 1], [22, 31, 0]], [[25, 0, 0], [24, 27, 0]], [[25, 0, 1], [23, 30, 1]], [[25, 0, 2], [23, 30, 0]], [[25, 0, 3], [24, 28, 0]], [[25, 0, 4], [23, 31, 1]], [[26, 0, 3], [23, 31, 0]], [[26, 0, 2], [23, 31, 1]], [[26, 0, 1], [24, 30, 1]], [[26, 0, 0], [24, 30, 0]], [[26, 0, 1], [26, 27, 1]], [[26, 0, 2], [26, 27, 0]], [[26, 0, 3], [24, 31, 0]], [[26, 0, 4], [25, 30, 1]], [[27, 0, 3], [25, 30, 0]], [[27, 0, 2], [28, 24, 0]], [[27, 0, 1], [25, 31, 1]], [[27, 0, 0], [25, 31, 0]], [[27, 0, 1], [25, 31, 1]], [[27, 0, 2], [26, 30, 1]], [[27, 0, 3], [26, 30, 0]], [[27, 0, 4], [26, 31, 1]], [[28, 0, 4], [26, 31, 0]], [[28, 0, 3], [28, 27, 0]], [[28, 0, 2], [27, 30, 1]], [[28, 0, 1], [27, 30, 0]], [[28, 0, 0], [28, 28, 0]], [[28, 0, 1], [27, 31, 1]], [[28, 0, 2], [27, 31, 0]], [[28, 0, 3], [27, 31, 1]], [[28, 0, 4], [28, 30, 1]], [[29, 0, 3], [28, 30, 0]], [[29, 0, 2], [30, 27, 1]], [[29, 0, 1], [30, 27, 0]], [[29, 0, 0], [28, 31, 0]], [[29, 0, 1], [29, 30, 1]], [[29, 0, 2], [29, 30, 0]], [[29, 0, 3], [29, 30, 1]], [[29, 0, 4], [29, 31, 1]], [[30, 0, 3], [29, 31, 0]], [[30, 0, 2], [29, 31, 1]], [[30, 0, 1], [30, 30, 1]], [[30, 0, 0], [30, 30, 0]], [[30, 0, 1], [30, 31, 1]], [[30, 0, 2], [30, 31, 0]], [[30, 0, 3], [30, 31, 1]], [[30, 0, 4], [31, 30, 1]], [[31, 0, 3], [31, 30, 0]], [[31, 0, 2], [31, 30, 1]], [[31, 0, 1], [31, 31, 1]], [[31, 0, 0], [31, 31, 0]]];
	var lookup_6_4 = [[[0, 0, 0], [0, 0, 0]], [[0, 0, 1], [0, 1, 0]], [[0, 0, 2], [0, 2, 0]], [[1, 0, 1], [0, 3, 1]], [[1, 0, 0], [0, 3, 0]], [[1, 0, 1], [0, 4, 0]], [[1, 0, 2], [0, 5, 0]], [[2, 0, 1], [0, 6, 1]], [[2, 0, 0], [0, 6, 0]], [[2, 0, 1], [0, 7, 0]], [[2, 0, 2], [0, 8, 0]], [[3, 0, 1], [0, 9, 1]], [[3, 0, 0], [0, 9, 0]], [[3, 0, 1], [0, 10, 0]], [[3, 0, 2], [0, 11, 0]], [[4, 0, 1], [0, 12, 1]], [[4, 0, 0], [0, 12, 0]], [[4, 0, 1], [0, 13, 0]], [[4, 0, 2], [0, 14, 0]], [[5, 0, 1], [0, 15, 1]], [[5, 0, 0], [0, 15, 0]], [[5, 0, 1], [0, 16, 0]], [[5, 0, 2], [1, 15, 0]], [[6, 0, 1], [0, 17, 0]], [[6, 0, 0], [0, 18, 0]], [[6, 0, 1], [0, 19, 0]], [[6, 0, 2], [3, 14, 0]], [[7, 0, 1], [0, 20, 0]], [[7, 0, 0], [0, 21, 0]], [[7, 0, 1], [0, 22, 0]], [[7, 0, 2], [4, 15, 0]], [[8, 0, 1], [0, 23, 0]], [[8, 0, 0], [0, 24, 0]], [[8, 0, 1], [0, 25, 0]], [[8, 0, 2], [6, 14, 0]], [[9, 0, 1], [0, 26, 0]], [[9, 0, 0], [0, 27, 0]], [[9, 0, 1], [0, 28, 0]], [[9, 0, 2], [7, 15, 0]], [[10, 0, 1], [0, 29, 0]], [[10, 0, 0], [0, 30, 0]], [[10, 0, 1], [0, 31, 0]], [[10, 0, 2], [9, 14, 0]], [[11, 0, 1], [0, 32, 0]], [[11, 0, 0], [0, 33, 0]], [[11, 0, 1], [2, 30, 0]], [[11, 0, 2], [0, 34, 0]], [[12, 0, 1], [0, 35, 0]], [[12, 0, 0], [0, 36, 0]], [[12, 0, 1], [3, 31, 0]], [[12, 0, 2], [0, 37, 0]], [[13, 0, 1], [0, 38, 0]], [[13, 0, 0], [0, 39, 0]], [[13, 0, 1], [5, 30, 0]], [[13, 0, 2], [0, 40, 0]], [[14, 0, 1], [0, 41, 0]], [[14, 0, 0], [0, 42, 0]], [[14, 0, 1], [6, 31, 0]], [[14, 0, 2], [0, 43, 0]], [[15, 0, 1], [0, 44, 0]], [[15, 0, 0], [0, 45, 0]], [[15, 0, 1], [8, 30, 0]], [[15, 0, 2], [0, 46, 0]], [[16, 0, 2], [0, 47, 0]], [[16, 0, 1], [1, 46, 0]], [[16, 0, 0], [0, 48, 0]], [[16, 0, 1], [0, 49, 0]], [[16, 0, 2], [0, 50, 0]], [[17, 0, 1], [2, 47, 0]], [[17, 0, 0], [0, 51, 0]], [[17, 0, 1], [0, 52, 0]], [[17, 0, 2], [0, 53, 0]], [[18, 0, 1], [4, 46, 0]], [[18, 0, 0], [0, 54, 0]], [[18, 0, 1], [0, 55, 0]], [[18, 0, 2], [0, 56, 0]], [[19, 0, 1], [5, 47, 0]], [[19, 0, 0], [0, 57, 0]], [[19, 0, 1], [0, 58, 0]], [[19, 0, 2], [0, 59, 0]], [[20, 0, 1], [7, 46, 0]], [[20, 0, 0], [0, 60, 0]], [[20, 0, 1], [0, 61, 0]], [[20, 0, 2], [0, 62, 0]], [[21, 0, 1], [8, 47, 0]], [[21, 0, 0], [0, 63, 0]], [[21, 0, 1], [1, 62, 0]], [[21, 0, 2], [1, 63, 0]], [[22, 0, 1], [10, 46, 0]], [[22, 0, 0], [2, 62, 0]], [[22, 0, 1], [2, 63, 0]], [[22, 0, 2], [3, 62, 0]], [[23, 0, 1], [11, 47, 0]], [[23, 0, 0], [3, 63, 0]], [[23, 0, 1], [4, 62, 0]], [[23, 0, 2], [4, 63, 0]], [[24, 0, 1], [13, 46, 0]], [[24, 0, 0], [5, 62, 0]], [[24, 0, 1], [5, 63, 0]], [[24, 0, 2], [6, 62, 0]], [[25, 0, 1], [14, 47, 0]], [[25, 0, 0], [6, 63, 0]], [[25, 0, 1], [7, 62, 0]], [[25, 0, 2], [7, 63, 0]], [[26, 0, 1], [16, 45, 0]], [[26, 0, 0], [8, 62, 0]], [[26, 0, 1], [8, 63, 0]], [[26, 0, 2], [9, 62, 0]], [[27, 0, 1], [16, 48, 0]], [[27, 0, 0], [9, 63, 0]], [[27, 0, 1], [10, 62, 0]], [[27, 0, 2], [10, 63, 0]], [[28, 0, 1], [16, 51, 0]], [[28, 0, 0], [11, 62, 0]], [[28, 0, 1], [11, 63, 0]], [[28, 0, 2], [12, 62, 0]], [[29, 0, 1], [16, 54, 0]], [[29, 0, 0], [12, 63, 0]], [[29, 0, 1], [13, 62, 0]], [[29, 0, 2], [13, 63, 0]], [[30, 0, 1], [16, 57, 0]], [[30, 0, 0], [14, 62, 0]], [[30, 0, 1], [14, 63, 0]], [[30, 0, 2], [15, 62, 0]], [[31, 0, 1], [16, 60, 0]], [[31, 0, 0], [15, 63, 0]], [[31, 0, 1], [24, 46, 0]], [[31, 0, 2], [16, 62, 0]], [[32, 0, 2], [16, 63, 0]], [[32, 0, 1], [17, 62, 0]], [[32, 0, 0], [25, 47, 0]], [[32, 0, 1], [17, 63, 0]], [[32, 0, 2], [18, 62, 0]], [[33, 0, 1], [18, 63, 0]], [[33, 0, 0], [27, 46, 0]], [[33, 0, 1], [19, 62, 0]], [[33, 0, 2], [19, 63, 0]], [[34, 0, 1], [20, 62, 0]], [[34, 0, 0], [28, 47, 0]], [[34, 0, 1], [20, 63, 0]], [[34, 0, 2], [21, 62, 0]], [[35, 0, 1], [21, 63, 0]], [[35, 0, 0], [30, 46, 0]], [[35, 0, 1], [22, 62, 0]], [[35, 0, 2], [22, 63, 0]], [[36, 0, 1], [23, 62, 0]], [[36, 0, 0], [31, 47, 0]], [[36, 0, 1], [23, 63, 0]], [[36, 0, 2], [24, 62, 0]], [[37, 0, 1], [24, 63, 0]], [[37, 0, 0], [32, 47, 0]], [[37, 0, 1], [25, 62, 0]], [[37, 0, 2], [25, 63, 0]], [[38, 0, 1], [26, 62, 0]], [[38, 0, 0], [32, 50, 0]], [[38, 0, 1], [26, 63, 0]], [[38, 0, 2], [27, 62, 0]], [[39, 0, 1], [27, 63, 0]], [[39, 0, 0], [32, 53, 0]], [[39, 0, 1], [28, 62, 0]], [[39, 0, 2], [28, 63, 0]], [[40, 0, 1], [29, 62, 0]], [[40, 0, 0], [32, 56, 0]], [[40, 0, 1], [29, 63, 0]], [[40, 0, 2], [30, 62, 0]], [[41, 0, 1], [30, 63, 0]], [[41, 0, 0], [32, 59, 0]], [[41, 0, 1], [31, 62, 0]], [[41, 0, 2], [31, 63, 0]], [[42, 0, 1], [32, 61, 0]], [[42, 0, 0], [32, 62, 0]], [[42, 0, 1], [32, 63, 0]], [[42, 0, 2], [41, 46, 0]], [[43, 0, 1], [33, 62, 0]], [[43, 0, 0], [33, 63, 0]], [[43, 0, 1], [34, 62, 0]], [[43, 0, 2], [42, 47, 0]], [[44, 0, 1], [34, 63, 0]], [[44, 0, 0], [35, 62, 0]], [[44, 0, 1], [35, 63, 0]], [[44, 0, 2], [44, 46, 0]], [[45, 0, 1], [36, 62, 0]], [[45, 0, 0], [36, 63, 0]], [[45, 0, 1], [37, 62, 0]], [[45, 0, 2], [45, 47, 0]], [[46, 0, 1], [37, 63, 0]], [[46, 0, 0], [38, 62, 0]], [[46, 0, 1], [38, 63, 0]], [[46, 0, 2], [47, 46, 0]], [[47, 0, 1], [39, 62, 0]], [[47, 0, 0], [39, 63, 0]], [[47, 0, 1], [40, 62, 0]], [[47, 0, 2], [48, 46, 0]], [[48, 0, 2], [40, 63, 0]], [[48, 0, 1], [41, 62, 0]], [[48, 0, 0], [41, 63, 0]], [[48, 0, 1], [48, 49, 0]], [[48, 0, 2], [42, 62, 0]], [[49, 0, 1], [42, 63, 0]], [[49, 0, 0], [43, 62, 0]], [[49, 0, 1], [48, 52, 0]], [[49, 0, 2], [43, 63, 0]], [[50, 0, 1], [44, 62, 0]], [[50, 0, 0], [44, 63, 0]], [[50, 0, 1], [48, 55, 0]], [[50, 0, 2], [45, 62, 0]], [[51, 0, 1], [45, 63, 0]], [[51, 0, 0], [46, 62, 0]], [[51, 0, 1], [48, 58, 0]], [[51, 0, 2], [46, 63, 0]], [[52, 0, 1], [47, 62, 0]], [[52, 0, 0], [47, 63, 0]], [[52, 0, 1], [48, 61, 0]], [[52, 0, 2], [48, 62, 0]], [[53, 0, 1], [56, 47, 0]], [[53, 0, 0], [48, 63, 0]], [[53, 0, 1], [49, 62, 0]], [[53, 0, 2], [49, 63, 0]], [[54, 0, 1], [58, 46, 0]], [[54, 0, 0], [50, 62, 0]], [[54, 0, 1], [50, 63, 0]], [[54, 0, 2], [51, 62, 0]], [[55, 0, 1], [59, 47, 0]], [[55, 0, 0], [51, 63, 0]], [[55, 0, 1], [52, 62, 0]], [[55, 0, 2], [52, 63, 0]], [[56, 0, 1], [61, 46, 0]], [[56, 0, 0], [53, 62, 0]], [[56, 0, 1], [53, 63, 0]], [[56, 0, 2], [54, 62, 0]], [[57, 0, 1], [62, 47, 0]], [[57, 0, 0], [54, 63, 0]], [[57, 0, 1], [55, 62, 0]], [[57, 0, 2], [55, 63, 0]], [[58, 0, 1], [56, 62, 1]], [[58, 0, 0], [56, 62, 0]], [[58, 0, 1], [56, 63, 0]], [[58, 0, 2], [57, 62, 0]], [[59, 0, 1], [57, 63, 1]], [[59, 0, 0], [57, 63, 0]], [[59, 0, 1], [58, 62, 0]], [[59, 0, 2], [58, 63, 0]], [[60, 0, 1], [59, 62, 1]], [[60, 0, 0], [59, 62, 0]], [[60, 0, 1], [59, 63, 0]], [[60, 0, 2], [60, 62, 0]], [[61, 0, 1], [60, 63, 1]], [[61, 0, 0], [60, 63, 0]], [[61, 0, 1], [61, 62, 0]], [[61, 0, 2], [61, 63, 0]], [[62, 0, 1], [62, 62, 1]], [[62, 0, 0], [62, 62, 0]], [[62, 0, 1], [62, 63, 0]], [[62, 0, 2], [63, 62, 0]], [[63, 0, 1], [63, 63, 1]], [[63, 0, 0], [63, 63, 0]]];

	function floatToInt(value, limit) {
		var integer = parseInt(value + 0.5);
		if (integer < 0) return 0;
		if (integer > limit) return integer;
		return integer;
	}

	function floatTo565(color) {
		var r = floatToInt(31.0 * color.x, 31);
		var g = floatToInt(63.0 * color.y, 63);
		var b = floatToInt(31.0 * color.z, 31);
		return r << 11 | g << 5 | b;
	}

	function writeColourBlock(firstColor, secondColor, indices, result, blockOffset) {
		result[blockOffset + 0] = firstColor & 0xff;
		result[blockOffset + 1] = firstColor >> 8;
		result[blockOffset + 2] = secondColor & 0xff;
		result[blockOffset + 3] = secondColor >> 8;

		for (var y = 0; y < 4; y++) {
			result[blockOffset + 4 + y] = indices[4 * y + 0] | indices[4 * y + 1] << 2 | indices[4 * y + 2] << 4 | indices[4 * y + 3] << 6;
		}
	}

	function writeColourBlock3(start, end, indices, result, blockOffset) {
		var firstColor = floatTo565(start);
		var secondColor = floatTo565(end);
		var remapped;

		if (firstColor <= secondColor) {
			remapped = indices.slice();
		} else {
			var _ref = [secondColor, firstColor];
			firstColor = _ref[0];
			secondColor = _ref[1];
			remapped = indices.map(function (index) {
				return index === 0 ? 1 : index === 1 ? 0 : index;
			});
		}

		writeColourBlock(firstColor, secondColor, remapped, result, blockOffset);
	}

	function writeColourBlock4(start, end, indices, result, blockOffset) {
		var firstColor = floatTo565(start);
		var secondColor = floatTo565(end);
		var remapped;

		if (firstColor < secondColor) {
			var _ref2 = [secondColor, firstColor];
			firstColor = _ref2[0];
			secondColor = _ref2[1];
			remapped = indices.map(function (index) {
				return (index ^ 0x1) & 0x3;
			});
		} else if (firstColor == secondColor) {
			remapped = new Array(16).fill(0);
		} else {
			remapped = indices.slice();
		}

		writeColourBlock(firstColor, secondColor, remapped, result, blockOffset);
	}

	var ColorSet = function () {
		function ColorSet(rgba, mask, flags) {
			_classCallCheck(this, ColorSet);

			this.flags = flags;
			this._count = 0;
			this._transparent = false;
			this._remap = [];
			this._weights = [];
			this._points = [];
			var isDxt1 = (this.flags & kDxt1) != 0;
			var weightByAlpha = (this.flags & kWeightColourByAlpha) != 0;

			for (var i = 0; i < 16; i++) {
				var bit = 1 << i;

				if ((mask & bit) == 0) {
					this._remap[i] = -1;
					continue;
				}

				if (isDxt1 && rgba[4 * i + 3] < 128) {
					this._remap[i] = -1;
					this._transparent = true;
					continue;
				}

				for (var j = 0;; j++) {
					if (j == i) {
						var r = rgba[4 * i] / 255.0;
						var g = rgba[4 * i + 1] / 255.0;
						var b = rgba[4 * i + 2] / 255.0;
						var a = (rgba[4 * i + 3] + 1) / 256.0;
						this._points[this._count] = new Vec3(r, g, b);
						this._weights[this._count] = weightByAlpha ? a : 1.0;
						this._remap[i] = this._count;
						this._count++;
						break;
					}

					var oldbit = 1 << j;
					var match = (mask & oldbit) != 0 && rgba[4 * i] == rgba[4 * j] && rgba[4 * i + 1] == rgba[4 * j + 1] && rgba[4 * i + 2] == rgba[4 * j + 2] && (rgba[4 * j + 3] >= 128 || !isDxt1);

					if (match) {
						var index = this._remap[j];
						var w = (rgba[4 * i + 3] + 1) / 256.0;
						this._weights[index] += weightByAlpha ? w : 1.0;
						this._remap[i] = index;
						break;
					}
				}
			}

			for (var _i = 0; _i < this._count; ++_i) {
				this._weights[_i] = Math.sqrt(this._weights[_i]);
			}
		}

		_createClass(ColorSet, [{
			key: "transparent",
			get: function get() {
				return this._transparent;
			}
		}, {
			key: "count",
			get: function get() {
				return this._count;
			}
		}, {
			key: "points",
			get: function get() {
				return Object.freeze(this._points.slice());
			}
		}, {
			key: "weights",
			get: function get() {
				return Object.freeze(this._weights.slice());
			}
		}, {
			key: "remapIndicesSingle",
			value: function remapIndicesSingle(singleIndex, target) {
				var result = this._remap.map(function (index) {
					return index === -1 ? 3 : singleIndex;
				});

				target.forEach(function (_, i) {
					return target[i] = result[i];
				});
			}
		}, {
			key: "remapIndices",
			value: function remapIndices(indexMap, target) {
				var result = this._remap.map(function (index) {
					return index === -1 ? 3 : indexMap[index];
				});

				target.forEach(function (_, i) {
					return target[i] = result[i];
				});
			}
		}]);

		return ColorSet;
	}();

	var ColorFit = function () {
		function ColorFit(colorSet) {
			_classCallCheck(this, ColorFit);

			this.colors = colorSet;
			this.flags = colorSet.flags;
		}

		_createClass(ColorFit, [{
			key: "compress",
			value: function compress(result, offset) {
				var isDxt1 = (this.flags & kDxt1) != 0;

				if (isDxt1) {
					this.compress3(result, offset);
					if (!this.colors.transparent) this.compress4(result, offset);
				} else this.compress4(result, offset);
			}
		}, {
			key: "compress3",
			value: function compress3(result, offset) {}
		}, {
			key: "compress4",
			value: function compress4(result, offset) {}
		}]);

		return ColorFit;
	}();

	var SingleColourFit = function (_ColorFit) {
		_inherits(SingleColourFit, _ColorFit);

		var _super = _createSuper(SingleColourFit);

		function SingleColourFit(colorSet) {
			var _this;

			_classCallCheck(this, SingleColourFit);

			_this = _super.call(this, colorSet);
			var singleColor = colorSet.points[0];
			_this.color = singleColor.colorInt;
			_this.start = new Vec3(0);
			_this.end = new Vec3(0);
			_this.index = 0;
			_this.error = Infinity;
			_this.bestError = Infinity;
			return _this;
		}

		_createClass(SingleColourFit, [{
			key: "compressBase",
			value: function compressBase(lookups, saveFunc) {
				this.computeEndPoints(lookups);

				if (this.error < this.bestError) {
					var indices = new Uint8Array(16);
					this.colors.remapIndicesSingle(this.index, indices);
					saveFunc(this.start, this.end, indices);
					this.bestError = this.error;
				}
			}
		}, {
			key: "compress3",
			value: function compress3(result, offset) {
				var lookups = [lookup_5_3, lookup_6_3, lookup_5_3];

				var saveFunc = function saveFunc(start, end, indices) {
					return writeColourBlock3(start, end, indices, result, offset);
				};

				this.compressBase(lookups, saveFunc);
			}
		}, {
			key: "compress4",
			value: function compress4(result, offset) {
				var lookups = [lookup_5_4, lookup_6_4, lookup_5_4];

				var saveFunc = function saveFunc(start, end, indices) {
					return writeColourBlock4(start, end, indices, result, offset);
				};

				this.compressBase(lookups, saveFunc);
			}
		}, {
			key: "computeEndPoints",
			value: function computeEndPoints(lookups) {
				this.error = Infinity;

				for (var index = 0; index < 2; index++) {
					var sources = [];
					var error = 0;

					for (var channel = 0; channel < 3; channel++) {
						var lookup = lookups[channel];
						var target = this.color[channel];
						sources[channel] = lookup[target][index];
						var diff = sources[channel][2];
						error += diff * diff;
					}

					if (error < this.error) {
						this.start = new Vec3(sources[0][0] / 31.0, sources[1][0] / 63.0, sources[2][0] / 31.0);
						this.end = new Vec3(sources[0][1] / 31.0, sources[1][1] / 63.0, sources[2][1] / 31.0);
						this.index = 2 * index;
						this.error = error;
					}
				}
			}
		}]);

		return SingleColourFit;
	}(ColorFit);

	var RangeFit = function (_ColorFit2) {
		_inherits(RangeFit, _ColorFit2);

		var _super2 = _createSuper(RangeFit);

		function RangeFit(colorSet) {
			var _this2;

			_classCallCheck(this, RangeFit);

			_this2 = _super2.call(this, colorSet);
			_this2.metric = new Vec3(1);

			if ((_this2.flags & kColourMetricPerceptual) !== 0) {
				_this2.metric.set(0.2126, 0.7152, 0.0722);
			}

			_this2.start = new Vec3(0);
			_this2.end = new Vec3(0);
			_this2.bestError = Infinity;

			_this2.computePoints();

			return _this2;
		}

		_createClass(RangeFit, [{
			key: "compressBase",
			value: function compressBase(codes, saveFunc) {
				var _this3 = this;

				var values = this.colors.points;
				var error = 0;
				var closest = values.map(function (color) {
					var minDist = Infinity;
					var packedIndex = codes.reduce(function (idx, code, j) {
						var dist = Vec3.sub(color, code).multVector(_this3.metric).lengthSq;
						if (dist >= minDist) return idx;
						minDist = dist;
						return j;
					}, 0);
					error += minDist;
					return packedIndex;
				});

				if (error < this.bestError) {
					var indices = new Uint8Array(16);
					this.colors.remapIndices(closest, indices);
					saveFunc(this.start, this.end, indices);
					this.bestError = error;
				}
			}
		}, {
			key: "compress3",
			value: function compress3(result, offset) {
				var codes = [this.start.clone(), this.end.clone(), Vec3.interpolate(this.start, this.end, 0.5)];

				var saveFunc = function saveFunc(start, end, indices) {
					return writeColourBlock3(start, end, indices, result, offset);
				};

				this.compressBase(codes, saveFunc);
			}
		}, {
			key: "compress4",
			value: function compress4(result, offset) {
				var codes = [this.start.clone(), this.end.clone(), Vec3.interpolate(this.start, this.end, 1 / 3), Vec3.interpolate(this.start, this.end, 2 / 3)];

				var saveFunc = function saveFunc(start, end, indices) {
					return writeColourBlock4(start, end, indices, result, offset);
				};

				this.compressBase(codes, saveFunc);
			}
		}, {
			key: "computePoints",
			value: function computePoints() {
				var _this$colors = this.colors,
						count = _this$colors.count,
						values = _this$colors.points,
						weights = _this$colors.weights;
				if (count <= 0) return;
				var principle = computePCA(values, weights);
				var start, end, min, max;
				start = end = values[0];
				min = max = Vec3.dot(start, principle);

				for (var i = 1; i < count; i++) {
					var value = Vec3.dot(values[i], principle);

					if (value < min) {
						start = values[i];
						min = value;
					} else if (value > max) {
						end = values[i];
						max = value;
					}
				}

				this.start = start.clampGrid().clone();
				this.end = end.clampGrid().clone();
			}
		}]);

		return RangeFit;
	}(ColorFit);

	var ClusterFit = function (_ColorFit3) {
		_inherits(ClusterFit, _ColorFit3);

		var _super3 = _createSuper(ClusterFit);

		function ClusterFit(colorSet) {
			var _this4;

			_classCallCheck(this, ClusterFit);

			_this4 = _super3.call(this, colorSet);
			var kMaxIterations = 8;
			_this4.iterationCount = colorSet.flags & kColourIterativeClusterFit ? kMaxIterations : 1;
			_this4.bestError = Infinity;
			_this4.metric = new Vec4(1);

			if ((_this4.flags & kColourMetricPerceptual) !== 0) {
				_this4.metric.set(0.2126, 0.7152, 0.0722, 0);
			}

			var _this4$colors = _this4.colors,
					values = _this4$colors.points,
					weights = _this4$colors.weights;
			_this4.principle = computePCA(values, weights);
			_this4.order = new Uint8Array(16 * kMaxIterations);
			_this4.pointsWeights = [];
			_this4.xSum_wSum = new Vec4(0);
			return _this4;
		}

		_createClass(ClusterFit, [{
			key: "constructOrdering",
			value: function constructOrdering(axis, iteration) {
				var currentOrder = this.makeOrder(axis);
				this.copyOrderToThisOrder(currentOrder, iteration);
				var uniqueOrder = this.checkOrderUnique(currentOrder, iteration);
				if (!uniqueOrder) return false;
				this.copyOrderWeight(currentOrder);
				return true;
			}
		}, {
			key: "compress3",
			value: function compress3(result, offset) {
				var aabbx = function aabbx(_ref) {
					var part0 = _ref[0],
							part1 = _ref[2],
							part2 = _ref[3];
					var const1_2 = new Vec4(1 / 2, 1 / 2, 1 / 2, 1 / 4);
					var alphax_sum = Vec4.multiplyAdd(part1, const1_2, part0);
					var alpha2_sum = alphax_sum.splatW;
					var betax_sum = Vec4.multiplyAdd(part1, const1_2, part2);
					var beta2_sum = betax_sum.splatW;
					var alphabeta_sum = Vec4.multVector(part1, const1_2).splatW;
					return {
						ax: alphax_sum,
						aa: alpha2_sum,
						bx: betax_sum,
						bb: beta2_sum,
						ab: alphabeta_sum
					};
				};

				var saveFunc = function saveFunc(start, end, indices) {
					return writeColourBlock3(start, end, indices, result, offset);
				};

				this.compressBase(aabbx, saveFunc, 2);
			}
		}, {
			key: "compress4",
			value: function compress4(result, offset) {
				var aabbx = function aabbx(_ref2) {
					var part0 = _ref2[0],
							part1 = _ref2[1],
							part2 = _ref2[2],
							part3 = _ref2[3];
					var const1_3 = new Vec4(1 / 3, 1 / 3, 1 / 3, 1 / 9);
					var const2_3 = new Vec4(2 / 3, 2 / 3, 2 / 3, 4 / 9);
					var const2_9 = new Vec4(2 / 9);
					var alphax_sum = Vec4.multiplyAdd(part2, const1_3, Vec4.multiplyAdd(part1, const2_3, part0));
					var alpha2_sum = alphax_sum.splatW;
					var betax_sum = Vec4.multiplyAdd(part1, const1_3, Vec4.multiplyAdd(part2, const2_3, part3));
					var beta2_sum = betax_sum.splatW;
					var alphabeta_sum = Vec4.multVector(const2_9, Vec4.add(part1, part2)).splatW;
					return {
						ax: alphax_sum,
						aa: alpha2_sum,
						bx: betax_sum,
						bb: beta2_sum,
						ab: alphabeta_sum
					};
				};

				var saveFunc = function saveFunc(start, end, indices) {
					return writeColourBlock4(start, end, indices, result, offset);
				};

				this.compressBase(aabbx, saveFunc, 3);
			}
		}, {
			key: "compressBase",
			value: function compressBase(aabbFunc, saveFunc) {
				var _this5 = this;

				var repeater = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
				this.constructOrdering(this.principle, 0);
				var best = {
					start: new Vec4(0),
					end: new Vec4(0),
					error: this.bestError,
					iteration: 0,
					bestI: 0,
					bestJ: 0
				};
				if (repeater === 3) best.bestK = 0;

				var leastSquares = function leastSquares(parts, internalIndices) {
					var aabbx = aabbFunc(parts);

					var internalBest = _this5.computeOptimalPoints(aabbx);

					if (internalBest.error < best.error) {
						best = _objectSpread2(_objectSpread2({}, internalBest), internalIndices);
						return true;
					}

					return false;
				};

				for (var iterationIndex = 0;;) {
					this.clusterIterate(iterationIndex, leastSquares, repeater);
					if (best.iteration != iterationIndex) break;
					iterationIndex++;
					if (iterationIndex == this.iterationCount) break;
					var newAxis = Vec4.sub(best.end, best.start).xyz;
					if (!this.constructOrdering(newAxis, iterationIndex)) break;
				}

				if (best.error < this.bestError) this.saveBlock(best, saveFunc);
			}
		}, {
			key: "makeOrder",
			value: function makeOrder(axis) {
				var _this$colors2 = this.colors,
						count = _this$colors2.count,
						values = _this$colors2.points;
				var dotProducts = values.map(function (color, i) {
					return Vec3.dot(color, axis);
				});
				return __arrayMaker({
					length: count
				}, function (_, i) {
					return i;
				}).sort(function (a, b) {
					if (dotProducts[a] - dotProducts[b] != 0) return dotProducts[a] - dotProducts[b];
					return a - b;
				});
			}
		}, {
			key: "copyOrderToThisOrder",
			value: function copyOrderToThisOrder(order, iteration) {
				var _this6 = this;

				var orderOffset = iteration * 16;
				order.forEach(function (ord, i) {
					_this6.order[orderOffset + i] = ord;
				});
			}
		}, {
			key: "checkOrderUnique",
			value: function checkOrderUnique(order, iteration) {
				var count = this.colors.count;

				for (var it = 0; it < iteration; it++) {
					var prevOffset = it * 16;
					var same = true;

					for (var i = 0; i < count; i++) {
						if (order[i] !== this.order[prevOffset + i]) {
							same = false;
							break;
						}
					}

					if (same) return false;
				}

				return true;
			}
		}, {
			key: "copyOrderWeight",
			value: function copyOrderWeight(order) {
				var _this$colors3 = this.colors,
						count = _this$colors3.count,
						unweighted = _this$colors3.points,
						weights = _this$colors3.weights;
				this.xSum_wSum.set(0);

				for (var i = 0; i < count; i++) {
					var j = order[i];
					var p = unweighted[j].toVec4(1);
					var w = new Vec4(weights[j]);
					var x = Vec4.multVector(p, w);
					this.pointsWeights[i] = x;
					this.xSum_wSum.addVector(x);
				}
			}
		}, {
			key: "computeOptimalPoints",
			value: function computeOptimalPoints(vectorPoint) {
				var ax = vectorPoint.ax,
						bx = vectorPoint.bx,
						aa = vectorPoint.aa,
						bb = vectorPoint.bb,
						ab = vectorPoint.ab;
				var factor = Vec4.negativeMultiplySubtract(ab, ab, Vec4.multVector(aa, bb)).reciprocal();
				var a = Vec4.negativeMultiplySubtract(bx, ab, Vec4.multVector(ax, bb)).multVector(factor);
				var b = Vec4.negativeMultiplySubtract(ax, ab, Vec4.multVector(bx, aa)).multVector(factor);
				a.clampGrid();
				b.clampGrid();
				var error = this.computeError(_objectSpread2({
					a: a,
					b: b
				}, vectorPoint));
				return {
					start: a,
					end: b,
					error: error
				};
			}
		}, {
			key: "computeError",
			value: function computeError(_ref3) {
				var a = _ref3.a,
						b = _ref3.b,
						ax = _ref3.ax,
						bx = _ref3.bx,
						aa = _ref3.aa,
						bb = _ref3.bb,
						ab = _ref3.ab;
				var two = new Vec4(2);
				var e1 = Vec4.multiplyAdd(Vec4.multVector(a, a), aa, Vec4.multVector(b, b).multVector(bb));
				var e2 = Vec4.negativeMultiplySubtract(a, ax, Vec4.multVector(a, b).multVector(ab));
				var e3 = Vec4.negativeMultiplySubtract(b, bx, e2);
				var e4 = Vec4.multiplyAdd(two, e3, e1);
				var e5 = Vec4.multVector(e4, this.metric);
				return e5.x + e5.y + e5.z;
			}
		}, {
			key: "saveBlock",
			value: function saveBlock(best, writeFunc) {
				var count = this.colors.count;
				var start = best.start,
						end = best.end,
						iteration = best.iteration,
						error = best.error,
						bestI = best.bestI,
						bestJ = best.bestJ,
						_best$bestK = best.bestK,
						bestK = _best$bestK === void 0 ? -1 : _best$bestK;
				var orderOffset = iteration * 16;
				var unordered = new Uint8Array(16);

				var mapper = function mapper(m) {
					if (m < bestI) return 0;
					if (m < bestJ) return 2;
					if (m < bestK) return 3;
					return 1;
				};

				for (var i = 0; i < count; i++) {
					unordered[this.order[orderOffset + i]] = mapper(i);
				}

				var bestIndices = new Uint8Array(16);
				this.colors.remapIndices(unordered, bestIndices);
				writeFunc(start.xyz, end.xyz, bestIndices);
				this.bestError = error;
			}
		}, {
			key: "clusterIterate",
			value: function clusterIterate(index, func) {
				var iterCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
				var count = this.colors.count;

				var indexMapper = function indexMapper(i, j, k) {
					var mapper = {
						bestI: i,
						bestJ: iterCount === 2 ? k : j,
						iteration: index
					};
					if (iterCount === 3) mapper.bestK = k;
					return mapper;
				};

				var part0 = new Vec4(0.0);

				for (var i = 0; i < count; i++) {
					var part1 = new Vec4(0.0);

					for (var j = i;;) {
						var preLastPart = j == 0 ? this.pointsWeights[0].clone() : new Vec4(0.0);
						var kmin = j == 0 ? 1 : j;

						for (var k = kmin;;) {
							var restPart = Vec4.sub(this.xSum_wSum, preLastPart).subVector(part1).subVector(part0);
							func([part0, part1, preLastPart, restPart], indexMapper(i, j, k));
							if (k == count) break;
							preLastPart.addVector(this.pointsWeights[k]);
							k++;
						}

						if (iterCount === 2) break;
						if (j === count) break;
						part1.addVector(this.pointsWeights[j]);
						j++;
					}

					part0.addVector(this.pointsWeights[i]);
				}
			}
		}]);

		return ClusterFit;
	}(ColorFit);

	function quantise(alpha) {
		var GRID = 15;
		var result = Math.floor(alpha * (GRID / 255) + 0.5);
		if (result < 0) return 0;
		if (result > GRID) return GRID;
		return result;
	}

	function compressAlphaDxt3(rgba, mask, result, offset) {
		for (var i = 0; i < 8; i++) {
			var quant1 = quantise(rgba[8 * i + 3]);
			var quant2 = quantise(rgba[8 * i + 7]);
			var bit1 = 1 << 2 * i;
			var bit2 = 1 << 2 * i + 1;
			if ((mask & bit1) == 0) quant1 = 0;
			if ((mask & bit2) == 0) quant2 = 0;
			result[offset + i] = quant1 | quant2 << 4;
		}
	}

	function compressAlphaDxt5(rgba, mask, result, offset) {
		var step5 = interpolateAlpha(rgba, mask, 5);
		var step7 = interpolateAlpha(rgba, mask, 7);
		if (step5.error <= step7.error) writeAlphaBlock5(step5, result, offset);else writeAlphaBlock7(step7, result, offset);
	}

	function interpolateAlpha(rgba, mask, steps) {
		var _setAlphaRange = setAlphaRange(rgba, mask, steps),
				min = _setAlphaRange.min,
				max = _setAlphaRange.max;

		var code = setAlphaCodeBook(min, max, steps);
		var indices = new Uint8Array(16);
		var error = fitCodes(rgba, mask, code, indices);
		return {
			min: min,
			max: max,
			indices: indices,
			error: error
		};
	}

	function setAlphaRange(rgba, mask, steps) {
		var min = 255;
		var max = 0;

		for (var i = 0; i < 16; i++) {
			var bit = 1 << i;
			if ((mask & bit) == 0) continue;
			var value = rgba[4 * i + 3];

			if (steps === 5) {
				if (value !== 0 && value < min) min = value;
				if (value !== 255 && value > max) max = value;
			} else {
				if (value < min) min = value;
				if (value > max) max = value;
			}
		}

		if (min > max) min = max;
		if (max - min < steps) max = Math.min(min + steps, 255);
		if (max - min < steps) min = Math.max(max - steps, 0);
		return {
			min: min,
			max: max
		};
	}

	function setAlphaCodeBook(min, max, steps) {
		var codes = [min, max].concat(__arrayMaker({
			length: steps - 1
		}, function (_, i) {
			return Math.floor(((steps - (i + 1)) * min + (i + 1) * max) / steps);
		}));

		if (steps === 5) {
			codes[6] = 0;
			codes[7] = 255;
		}

		return codes;
	}

	function fitCodes(rgba, mask, codes, indices) {
		var err = 0;

		for (var i = 0; i < 16; ++i) {
			var bit = 1 << i;

			if ((mask & bit) == 0) {
				indices[i] = 0;
				continue;
			}

			var value = rgba[4 * i + 3];
			var least = Infinity;
			var index = 0;

			for (var j = 0; j < 8; ++j) {
				var dist = value - codes[j];
				dist *= dist;

				if (dist < least) {
					least = dist;
					index = j;
				}
			}

			indices[i] = index;
			err += least;
		}

		return err;
	}

	function writeAlphaBlock5(_ref, result, offset) {
		var alpha0 = _ref.min,
				alpha1 = _ref.max,
				indices = _ref.indices;

		if (alpha0 > alpha1) {
			var swapped = indices.map(function (index) {
				if (index === 0) return 1;
				if (index === 1) return 0;
				if (index <= 5) return 7 - index;
				return index;
			});
			writeAlphaBlock(alpha1, alpha0, swapped, result, offset);
		} else writeAlphaBlock(alpha0, alpha1, indices, result, offset);
	}

	function writeAlphaBlock7(_ref2, result, offset) {
		var alpha0 = _ref2.min,
				alpha1 = _ref2.max,
				indices = _ref2.indices;

		if (alpha0 > alpha1) {
			var swapped = indices.map(function (index) {
				if (index === 0) return 1;
				if (index === 1) return 0;
				return 9 - index;
			});
			writeAlphaBlock(alpha1, alpha0, swapped, result, offset);
		} else writeAlphaBlock(alpha0, alpha1, indices, result, offset);
	}

	function writeAlphaBlock(alpha0, alpha1, indices, result, offset) {
		result[offset] = alpha0;
		result[offset + 1] = alpha1;
		var indicesPointer = 0;
		var resultPointer = offset + 2;

		for (var i = 0; i < 2; i++) {
			var value = 0;

			for (var j = 0; j < 8; ++j) {
				var index = indices[indicesPointer];
				value |= index << 3 * j;
				indicesPointer++;
			}

			for (var _j = 0; _j < 3; ++_j) {
				var byte = value >> 8 * _j & 0xff;
				result[resultPointer] = byte;
				resultPointer++;
			}
		}
	}

	function unpack565(color16bit) {
		var red = color16bit >> 11 & 0x1f;
		var green = color16bit >> 5 & 0x3f;
		var blue = color16bit & 0x1f;
		return [red << 3 | red >> 2, green << 2 | green >> 4, blue << 3 | blue >> 2, 255];
	}

	function interpolateColorArray(a, b, amount) {
		var result = a.map(function (aColor, i) {
			return Math.floor(aColor * (1 - amount) + b[i] * amount);
		});
		result[3] = 255;
		return result;
	}

	function unpackColorCodes(block, offset, isDxt1) {
		var color1 = block[offset] | block[offset + 1] << 8;
		var color2 = block[offset + 2] | block[offset + 3] << 8;
		var unpackedColor1 = unpack565(color1);
		var unpackedColor2 = unpack565(color2);
		return [unpackedColor1, unpackedColor2, isDxt1 && color1 <= color2 ? interpolateColorArray(unpackedColor1, unpackedColor2, 1 / 2) : interpolateColorArray(unpackedColor1, unpackedColor2, 1 / 3), isDxt1 && color1 <= color2 ? [0, 0, 0, 0] : interpolateColorArray(unpackedColor1, unpackedColor2, 2 / 3)];
	}

	function unpackIndices(block, blockOffset) {
		var offset = blockOffset + 4;
		var result = new Uint8Array(16);

		for (var i = 0; i < 4; i++) {
			var packedIndices = block[offset + i];
			result[i * 4 + 0] = packedIndices & 0x3;
			result[i * 4 + 1] = packedIndices >> 2 & 0x3;
			result[i * 4 + 2] = packedIndices >> 4 & 0x3;
			result[i * 4 + 3] = packedIndices >> 6 & 0x3;
		}

		return result;
	}

	function decompressColor(rgba, block, offset, isDxt1) {
		var colorCode = unpackColorCodes(block, offset, isDxt1);
		var indices = unpackIndices(block, offset);

		for (var i = 0; i < 16; i++) {
			for (var j = 0; j < 4; j++) {
				rgba[4 * i + j] = colorCode[indices[i]][j];
			}
		}
	}

	function decompressAlphaDxt3(rgba, block, offset) {
		for (var i = 0; i < 8; ++i) {
			var quant = block[offset + i];
			var lo = quant & 0x0f;
			var hi = quant & 0xf0;
			rgba[8 * i + 3] = lo | lo << 4;
			rgba[8 * i + 7] = hi | hi >> 4;
		}
	}

	function decompressAlphaDxt5(rgba, block, offset) {
		var alpha0 = block[offset + 0];
		var alpha1 = block[offset + 1];
		var codes = setAlphaCodeBook(alpha0, alpha1, alpha0 <= alpha1 ? 5 : 7);
		var indices = new Uint8Array(16);
		var indicePointer = 0;
		var bytePointer = 2;

		for (var i = 0; i < 2; i++) {
			var value = 0;

			for (var j = 0; j < 3; j++) {
				var byte = block[offset + bytePointer];
				value |= byte << 8 * j;
				bytePointer++;
			}

			for (var _j = 0; _j < 8; _j++) {
				var index = value >> 3 * _j & 0x7;
				indices[indicePointer] = index;
				indicePointer++;
			}
		}

		for (var _i = 0; _i < 16; ++_i) {
			rgba[4 * _i + 3] = codes[indices[_i]];
		}
	}

	/** @license
	-----------------------------------------------------------------------------
		Copyright (c) 2006 Simon Brown													si@sjbrown.co.uk
		Permission is hereby granted, free of charge, to any person obtaining
		a copy of this software and associated documentation files (the 
		"Software"), to	deal in the Software without restriction, including
		without limitation the rights to use, copy, modify, merge, publish,
		distribute, sublicense, and/or sell copies of the Software, and to 
		permit persons to whom the Software is furnished to do so, subject to 
		the following conditions:
		The above copyright notice and this permission notice shall be included
		in all copies or substantial portions of the Software.
		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
		OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
		MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
		IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
		CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
		TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
		SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
		
	-------------------------------------------------------------------------- */
	var DXT1_COMPRESSED_BYTES = 8;
	var DXT5_COMPRESSED_BYTES = 16;
	var COLORS = 4;
	var DECOMPRESSED_BLOCK_SIZE = 16;

	function blockRepeat(width, height, func) {
		for (var y = 0; y < height; y += 4) {
			for (var x = 0; x < width; x += 4) {
				func(x, y);
			}
		}
	}

	function rectRepeat(func) {
		for (var y = 0; y < 4; y++) {
			for (var x = 0; x < 4; x++) {
				func(x, y);
			}
		}
	}

	function FixFlags(flags) {
		var method = flags & (kDxt1 | kDxt3 | kDxt5);
		var fit = flags & (kColourIterativeClusterFit | kColourClusterFit | kColourRangeFit);
		var metric = flags & (kColourMetricPerceptual | kColourMetricUniform);
		var extra = flags & kWeightColourByAlpha;
		if (method != kDxt3 && method != kDxt5) method = kDxt1;
		if (fit != kColourRangeFit && fit != kColourIterativeClusterFit) fit = kColourClusterFit;
		if (metric != kColourMetricUniform) metric = kColourMetricPerceptual;
		return method | fit | metric | extra;
	}

	function GetStorageRequirements(width, height, flags) {
		flags = FixFlags(flags);
		var blockcount = Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4);
		var blocksize = (flags & kDxt1) !== 0 ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
		return blockcount * blocksize;
	}

	function extractColorBlock(img) {
		var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
				_ref$x = _ref.x,
				x = _ref$x === void 0 ? 0 : _ref$x,
				_ref$y = _ref.y,
				y = _ref$y === void 0 ? 0 : _ref$y,
				_ref$width = _ref.width,
				width = _ref$width === void 0 ? 0 : _ref$width,
				_ref$height = _ref.height,
				height = _ref$height === void 0 ? 0 : _ref$height;

		var block = new Uint8Array(DECOMPRESSED_BLOCK_SIZE * COLORS);
		var mask = 0;
		var blockColorOffset = 0;
		rectRepeat(function (px, py) {
			var sx = x + px;
			var sy = y + py;

			if (sx < width && sy < height) {
				var sourceColorOffset = COLORS * (width * sy + sx);

				for (var i = 0; i < COLORS; i++) {
					block[blockColorOffset++] = img[sourceColorOffset++];
				}

				mask |= 1 << 4 * py + px;
			} else blockColorOffset += COLORS;
		});
		return {
			block: block,
			mask: mask
		};
	}

	function copyBuffer(result, block) {
		var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
				_ref2$x = _ref2.x,
				x = _ref2$x === void 0 ? 0 : _ref2$x,
				_ref2$y = _ref2.y,
				y = _ref2$y === void 0 ? 0 : _ref2$y,
				_ref2$width = _ref2.width,
				width = _ref2$width === void 0 ? 0 : _ref2$width,
				_ref2$height = _ref2.height,
				height = _ref2$height === void 0 ? 0 : _ref2$height;

		var blockColorOffset = 0;
		rectRepeat(function (px, py) {
			var sx = x + px;
			var sy = y + py;

			if (sx < width && sy < height) {
				var resultColorOffset = COLORS * (width * sy + sx);

				for (var i = 0; i < COLORS; i++) {
					result[resultColorOffset + i] = block[blockColorOffset++];
				}
			} else blockColorOffset += COLORS;
		});
	}

	function getCompressor(colorSet) {
		if (colorSet.count === 1) return new SingleColourFit(colorSet);
		if ((colorSet.flags & kColourRangeFit) != 0 || colorSet.count == 0) return new RangeFit(colorSet);
		return new ClusterFit(colorSet);
	}

	function CompressMasked(rgba, mask, result, offset, flags) {
		flags = FixFlags(flags);
		var colorOffset = (flags & (kDxt3 | kDxt5)) !== 0 ? 8 : 0;
		var colors = new ColorSet(rgba, mask, flags);
		var compressor = getCompressor(colors);
		compressor.compress(result, offset + colorOffset);
		if ((flags & kDxt3) !== 0) compressAlphaDxt3(rgba, mask, result, offset);else if ((flags & kDxt5) !== 0) compressAlphaDxt5(rgba, mask, result, offset);
	}

	function decompressBlock(result, block, offset, flags) {
		flags = FixFlags(flags);
		var colorOffset = (flags & (kDxt3 | kDxt5)) !== 0 ? 8 : 0;
		decompressColor(result, block, offset + colorOffset, (flags & kDxt1) !== 0);
		if ((flags & kDxt3) !== 0) decompressAlphaDxt3(result, block, offset);else if ((flags & kDxt5) !== 0) decompressAlphaDxt5(result, block, offset);
	}

	function compressImage(source, width, height, result, flags) {
		flags = FixFlags(flags);
		var bytesPerBlock = (flags & kDxt1) !== 0 ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
		var targetBlockPointer = 0;
		blockRepeat(width, height, function (x, y) {
			var _extractColorBlock = extractColorBlock(source, {
				x: x,
				y: y,
				width: width,
				height: height
			}),
					sourceRGBA = _extractColorBlock.block,
					mask = _extractColorBlock.mask;

			CompressMasked(sourceRGBA, mask, result, targetBlockPointer, flags);
			targetBlockPointer += bytesPerBlock;
		});
	}

	function decompressImage(result, width, height, source, flags) {
		flags = FixFlags(flags);
		var bytesPerBlock = (flags & kDxt1) !== 0 ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
		var sourceBlockPointer = 0;

		for (var y = 0; y < height; y += 4) {
			for (var x = 0; x < width; x += 4) {
				var targetRGBA = new Uint8Array(DECOMPRESSED_BLOCK_SIZE * COLORS);
				decompressBlock(targetRGBA, source, sourceBlockPointer, flags);
				copyBuffer(result, targetRGBA, {
					x: x,
					y: y,
					width: width,
					height: height
				});
				sourceBlockPointer += bytesPerBlock;
			}
		}
	}

	var flags = {
		DXT1: kDxt1,
		DXT3: kDxt3,
		DXT5: kDxt5,
		ColourIterativeClusterFit: kColourIterativeClusterFit,
		ColourClusterFit: kColourClusterFit,
		ColourRangeFit: kColourRangeFit,
		ColourMetricPerceptual: kColourMetricPerceptual,
		ColourMetricUniform: kColourMetricUniform,
		WeightColourByAlpha: kWeightColourByAlpha
	};

	function compress(inputData, width, height, flags) {
		var source = inputData instanceof ArrayBuffer ? new Uint8Array(inputData) : inputData;
		var targetSize = GetStorageRequirements(width, height, flags);
		var result = new Uint8Array(targetSize);
		compressImage(source, width, height, result, flags);
		return result;
	}

	function decompress(inputData, width, height, flags) {
		var source = inputData instanceof ArrayBuffer ? new Uint8Array(inputData) : inputData;
		var targetSize = width * height * 4;
		var result = new Uint8Array(targetSize);
		decompressImage(result, width, height, source, flags);
		return result;
	}

	var Texture2DReader = function (_BaseReader) {
		_inherits(Texture2DReader, _BaseReader);

		var _super = _createSuper(Texture2DReader);

		function Texture2DReader() {
			_classCallCheck(this, Texture2DReader);

			return _super.apply(this, arguments);
		}

		_createClass(Texture2DReader, [{
			key: "read",
			value: function read(buffer) {
				var int32Reader = new Int32Reader();
				var uint32Reader = new UInt32Reader();
				var format = int32Reader.read(buffer);
				var width = uint32Reader.read(buffer);
				var height = uint32Reader.read(buffer);
				var mipCount = uint32Reader.read(buffer);
				if (mipCount > 1) console.warn("Found mipcount of ".concat(mipCount, ", only the first will be used."));
				var dataSize = uint32Reader.read(buffer);
				var data = buffer.read(dataSize);
				if (format == 4) data = decompress(data, width, height, flags.DXT1);else if (format == 5) data = decompress(data, width, height, flags.DXT3);else if (format == 6) data = decompress(data, width, height, flags.DXT5);else if (format == 2) {
					throw new Error('Texture2D format type ECT1 not implemented!');
				} else if (format != 0) throw new Error("Non-implemented Texture2D format type (".concat(format, ") found."));

				for (var i = 0; i < data.length; i += 4) {
					var inverseAlpha = 255 / data[i + 3];
					data[i] = Math.min(Math.ceil(data[i] * inverseAlpha), 255);
					data[i + 1] = Math.min(Math.ceil(data[i + 1] * inverseAlpha), 255);
					data[i + 2] = Math.min(Math.ceil(data[i + 2] * inverseAlpha), 255);
				}

				return {
					format: format,
					export: {
						type: this.type,
						data: data,
						width: width,
						height: height
					}
				};
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				var int32Reader = new Int32Reader();
				var uint32Reader = new UInt32Reader();
				this.writeIndex(buffer, resolver);
				var width = content.export.width;
				var height = content.export.height;
				int32Reader.write(buffer, content.format, null);
				uint32Reader.write(buffer, content.export.width, null);
				uint32Reader.write(buffer, content.export.height, null);
				uint32Reader.write(buffer, 1, null);
				var data = content.export.data;

				for (var i = 0; i < data.length; i += 4) {
					var alpha = data[i + 3] / 255;
					data[i] = Math.floor(data[i] * alpha);
					data[i + 1] = Math.floor(data[i + 1] * alpha);
					data[i + 2] = Math.floor(data[i + 2] * alpha);
				}

				if (content.format == 4) data = compress(data, width, height, flags.DXT1);else if (content.format == 5) data = compress(data, width, height, flags.DXT3);else if (content.format == 6) data = compress(data, width, height, flags.DXT5);
				uint32Reader.write(buffer, data.length, null);
				buffer.concat(data);
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.Texture2DReader':
						return true;

					default:
						return false;
				}
			}
		}]);

		return Texture2DReader;
	}(BaseReader);

	var Vector3Reader = function (_BaseReader) {
		_inherits(Vector3Reader, _BaseReader);

		var _super = _createSuper(Vector3Reader);

		function Vector3Reader() {
			_classCallCheck(this, Vector3Reader);

			return _super.apply(this, arguments);
		}

		_createClass(Vector3Reader, [{
			key: "read",
			value: function read(buffer) {
				var singleReader = new SingleReader();
				var x = singleReader.read(buffer);
				var y = singleReader.read(buffer);
				var z = singleReader.read(buffer);
				return {
					x: x,
					y: y,
					z: z
				};
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				var singleReader = new SingleReader();
				singleReader.write(buffer, content.x, null);
				singleReader.write(buffer, content.y, null);
				singleReader.write(buffer, content.z, null);
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.Vector3Reader':
					case 'Microsoft.Xna.Framework.Vector3':
						return true;

					default:
						return false;
				}
			}
		}]);

		return Vector3Reader;
	}(BaseReader);

	var SpriteFontReader = function (_BaseReader) {
		_inherits(SpriteFontReader, _BaseReader);

		var _super = _createSuper(SpriteFontReader);

		function SpriteFontReader() {
			_classCallCheck(this, SpriteFontReader);

			return _super.apply(this, arguments);
		}

		_createClass(SpriteFontReader, [{
			key: "read",
			value: function read(buffer, resolver) {
				var int32Reader = new Int32Reader();
				var singleReader = new SingleReader();
				var nullableCharReader = new NullableReader(new CharReader());
				var texture = resolver.read(buffer);
				var glyphs = resolver.read(buffer);
				var cropping = resolver.read(buffer);
				var characterMap = resolver.read(buffer);
				var verticalLineSpacing = int32Reader.read(buffer);
				var horizontalSpacing = singleReader.read(buffer);
				var kerning = resolver.read(buffer);
				var defaultCharacter = nullableCharReader.read(buffer);
				return {
					texture: texture,
					glyphs: glyphs,
					cropping: cropping,
					characterMap: characterMap,
					verticalLineSpacing: verticalLineSpacing,
					horizontalSpacing: horizontalSpacing,
					kerning: kerning,
					defaultCharacter: defaultCharacter
				};
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				var int32Reader = new Int32Reader();
				var charReader = new CharReader();
				var singleReader = new SingleReader();
				var nullableCharReader = new NullableReader(charReader);
				var texture2DReader = new Texture2DReader();
				var rectangleListReader = new ListReader(new RectangleReader());
				var charListReader = new ListReader(charReader);
				var vector3ListReader = new ListReader(new Vector3Reader());
				this.writeIndex(buffer, resolver);

				try {
					texture2DReader.write(buffer, content.texture, resolver);
					buffer.alloc(100000);
					rectangleListReader.write(buffer, content.glyphs, resolver);
					rectangleListReader.write(buffer, content.cropping, resolver);
					charListReader.write(buffer, content.characterMap, resolver);
					int32Reader.write(buffer, content.verticalLineSpacing, null);
					singleReader.write(buffer, content.horizontalSpacing, null);
					vector3ListReader.write(buffer, content.kerning, resolver);
					nullableCharReader.write(buffer, content.defaultCharacter, null);
				} catch (ex) {
					throw ex;
				}
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.SpriteFontReader':
						return true;

					default:
						return false;
				}
			}
		}, {
			key: "parseTypeList",
			value: function parseTypeList() {
				return ["SpriteFont", "Texture2D", 'List<Rectangle>', 'Rectangle', 'List<Rectangle>', 'Rectangle', 'List<Char>', 'Char', null, null, 'List<Vector3>', 'Vector3', 'Nullable<Char>', 'Char'];
			}
		}]);

		return SpriteFontReader;
	}(BaseReader);

	var TBinReader = function (_BaseReader) {
		_inherits(TBinReader, _BaseReader);

		var _super = _createSuper(TBinReader);

		function TBinReader() {
			_classCallCheck(this, TBinReader);

			return _super.apply(this, arguments);
		}

		_createClass(TBinReader, [{
			key: "read",
			value: function read(buffer) {
				var int32Reader = new Int32Reader();
				var size = int32Reader.read(buffer);
				var data = buffer.read(size);
				return {
					export: {
						type: this.type,
						data: data
					}
				};
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				this.writeIndex(buffer, resolver);
				var data = content.export.data;
				var int32Reader = new Int32Reader();
				int32Reader.write(buffer, data.byteLength, null);
				buffer.concat(data);
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'xTile.Pipeline.TideReader':
						return true;

					default:
						return false;
				}
			}
		}]);

		return TBinReader;
	}(BaseReader);

	var LightweightTexture2DReader = function (_BaseReader) {
		_inherits(LightweightTexture2DReader, _BaseReader);

		var _super = _createSuper(LightweightTexture2DReader);

		function LightweightTexture2DReader() {
			_classCallCheck(this, LightweightTexture2DReader);

			return _super.apply(this, arguments);
		}

		_createClass(LightweightTexture2DReader, [{
			key: "read",
			value: function read(buffer) {
				var int32Reader = new Int32Reader();
				var uint32Reader = new UInt32Reader();
				var format = int32Reader.read(buffer);
				var width = uint32Reader.read(buffer);
				var height = uint32Reader.read(buffer);
				var mipCount = uint32Reader.read(buffer);
				if (mipCount > 1) console.warn("Found mipcount of ".concat(mipCount, ", only the first will be used."));
				var dataSize = uint32Reader.read(buffer);
				var data = buffer.read(dataSize);
				if (format != 0) throw new Error("Compressed texture format is not supported!");

				for (var i = 0; i < data.length; i += 4) {
					var inverseAlpha = 255 / data[i + 3];
					data[i] = Math.min(Math.ceil(data[i] * inverseAlpha), 255);
					data[i + 1] = Math.min(Math.ceil(data[i + 1] * inverseAlpha), 255);
					data[i + 2] = Math.min(Math.ceil(data[i + 2] * inverseAlpha), 255);
				}

				return {
					format: format,
					export: {
						type: this.type,
						data: data,
						width: width,
						height: height
					}
				};
			}
		}, {
			key: "write",
			value: function write(buffer, content, resolver) {
				if (content.format != 0) throw new Error("Compressed texture format is not supported!");
				var int32Reader = new Int32Reader();
				var uint32Reader = new UInt32Reader();
				this.writeIndex(buffer, resolver);
				content.export.width;
				content.export.height;
				int32Reader.write(buffer, content.format, null);
				uint32Reader.write(buffer, content.export.width, null);
				uint32Reader.write(buffer, content.export.height, null);
				uint32Reader.write(buffer, 1, null);
				var data = content.export.data;

				for (var i = 0; i < data.length; i += 4) {
					var alpha = data[i + 3] / 255;
					data[i] = Math.floor(data[i] * alpha);
					data[i + 1] = Math.floor(data[i + 1] * alpha);
					data[i + 2] = Math.floor(data[i + 2] * alpha);
				}

				uint32Reader.write(buffer, data.length, null);
				buffer.concat(data);
			}
		}, {
			key: "isValueType",
			value: function isValueType() {
				return false;
			}
		}, {
			key: "type",
			get: function get() {
				return "Texture2D";
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.Texture2DReader':
						return true;

					default:
						return false;
				}
			}
		}, {
			key: "type",
			value: function type() {
				return "Texture2D";
			}
		}]);

		return LightweightTexture2DReader;
	}(BaseReader);

	var Vector2Reader = function (_BaseReader) {
		_inherits(Vector2Reader, _BaseReader);

		var _super = _createSuper(Vector2Reader);

		function Vector2Reader() {
			_classCallCheck(this, Vector2Reader);

			return _super.apply(this, arguments);
		}

		_createClass(Vector2Reader, [{
			key: "read",
			value: function read(buffer) {
				var singleReader = new SingleReader();
				var x = singleReader.read(buffer);
				var y = singleReader.read(buffer);
				return {
					x: x,
					y: y
				};
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.Vector2Reader':
					case 'Microsoft.Xna.Framework.Vector2':
						return true;

					default:
						return false;
				}
			}
		}]);

		return Vector2Reader;
	}(BaseReader);

	var Vector4Reader = function (_BaseReader) {
		_inherits(Vector4Reader, _BaseReader);

		var _super = _createSuper(Vector4Reader);

		function Vector4Reader() {
			_classCallCheck(this, Vector4Reader);

			return _super.apply(this, arguments);
		}

		_createClass(Vector4Reader, [{
			key: "read",
			value: function read(buffer) {
				var singleReader = new SingleReader();
				var x = singleReader.read(buffer);
				var y = singleReader.read(buffer);
				var z = singleReader.read(buffer);
				var w = singleReader.read(buffer);
				return {
					x: x,
					y: y,
					z: z,
					w: w
				};
			}
		}], [{
			key: "isTypeOf",
			value: function isTypeOf(type) {
				switch (type) {
					case 'Microsoft.Xna.Framework.Content.Vector4Reader':
					case 'Microsoft.Xna.Framework.Vector4':
						return true;

					default:
						return false;
				}
			}
		}]);

		return Vector4Reader;
	}(BaseReader);

	exports.ArrayReader = ArrayReader;
	exports.BaseReader = BaseReader;
	exports.BmFontReader = BmFontReader;
	exports.BooleanReader = BooleanReader;
	exports.CharReader = CharReader;
	exports.DictionaryReader = DictionaryReader;
	exports.DoubleReader = DoubleReader;
	exports.EffectReader = EffectReader;
	exports.Int32Reader = Int32Reader;
	exports.LightweightTexture2DReader = LightweightTexture2DReader;
	exports.ListReader = ListReader;
	exports.NullableReader = NullableReader;
	exports.RectangleReader = RectangleReader;
	exports.ReflectiveReader = ReflectiveReader;
	exports.SingleReader = SingleReader;
	exports.SpriteFontReader = SpriteFontReader;
	exports.StringReader = StringReader;
	exports.TBinReader = TBinReader;
	exports.Texture2DReader = Texture2DReader;
	exports.UInt32Reader = UInt32Reader;
	exports.Vector2Reader = Vector2Reader;
	exports.Vector3Reader = Vector3Reader;
	exports.Vector4Reader = Vector4Reader;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
