/**
 * from https://github.com/draivin/XNBNode
 * XnbExtract is using this code to parse yaml
 */


function isTypeObject(object) {
	return object && object.hasOwnProperty('type') && object.hasOwnProperty('data');
}
function stringify (o, gap, indentation) {
	if(isTypeObject(o)) {
		let s = stringify(o.data, gap, indentation);
		if(s.includes('\n')) {
			return ' #!' + o.type + s;
		} else {
			return s + ' #!' + o.type;
		}
	} else if(o && 'object' === typeof o) {

		let isArray = Array.isArray(o);
		if(Object.keys(o).length == 0) {
			if(isArray) return '[]';
			else return '{}';
		}

		let s = '\n';


		for(let k in o) {
			if(Object.hasOwnProperty.call(o, k)) {
				s += gap.repeat(indentation + 1);
				if (isArray) {
					s += '- ' + stringify(o[k], gap, indentation + 1);
				} else {
					if(k.includes(': ')) {
						s += stringify(k, gap, indentation + 1);
						s += ': ' + stringify(o[k], gap, indentation + 1);
					} else {
						s += k + ': ' + stringify(o[k], gap, indentation + 1);
					}
				}
				s += '\n';
			}
		}

		return s;
	} else if ('string' === typeof o) {
		return JSON.stringify(o);
	} else if ('undefined' === typeof o || o === null) {
		return 'null';
	} else if (!!o == o || +o == o) { //boolean & number
		return JSON.stringify(o);
	} else {
		throw new Error('Non-implemented parsing for ' + o);
	}
}

function preStringify(object, space=4) {
	var gap = ''
	if(typeof space == 'number') {
	  gap = ' '.repeat(Math.min(10, space))
	} else if(typeof space == 'string') {
	  gap = space.slice(0, 10)
	}

	return stringify(object, gap, -1)
}

class LineGenerator {
	constructor(lines, indentString, startingLine) {
		this.startingLine = startingLine || 0;
		this.lineIndex = -1;

		let filteredLines = [];
		for(let i = 0; i < lines.length; i++) {
			let trimmedLine = lines[i].trim();
			if(trimmedLine !== '') {
				filteredLines.push([lines[i], i]);
			}
		}

		this.lines = filteredLines;

		this.indentString = indentString || this.findIndentString();
	}

	getLineNumber() {
		return this.startingLine + this.lineIndex;
	}

	nextGroup() {
		let lines = [];
		let baseIndent = this.indentLevel(this.lineIndex + 1);

		while(!this.finished() && this.indentLevel(this.lineIndex + 1) >= baseIndent) {
			lines.push(this.next());
		}

		return new LineGenerator(lines, this.indentString, this.getLineNumber() - lines.length);
	}

	next() {
		if(this.finished()) throw new Error('Trying to next finished generator');
		this.lineIndex++;
		return this.getLine();
	}

	peek() {
		return this.getLine(this.lineIndex + 1);
	}

	finished() {
		return this.lineIndex == this.lines.length - 1;
	}

	getLine(index) {
		index = (index !== undefined) ? index  : this.lineIndex;
		if(index >= this.lines.length) return null;
		return this.lines[index][0];
	}

	findIndentString() {
		for(let [line] of this.lines) {
			if(!line.trim() || line.replace(/^\s+/,"") == line) continue;
			return line.match(/^(\s+)/)[1];
		}

		return '';
	}

	indentLevel(index) {
		index = (index !== undefined) ? index : this.lineIndex;
		if(index < 0) index = 0;
		let indentLevel = 0;
		let line = this.getLine(index);

		while(line.startsWith(this.indentString)) {
			line = line.slice(this.indentString.length);
			indentLevel++;
		}

		return indentLevel;
	}
}

function getObject(lineGroup, type) {
	let object;

	let baseIndent = lineGroup.indentLevel();

	while(!lineGroup.finished()) {
		let line = lineGroup.next()
		let trimmedLine = line.trim();

		let keyMatch = trimmedLine.match(/^(.*?):(?: |$)/);
		let typeMatch = trimmedLine.match(/#!([\w<,>]+)/);
		let key, value, type;

		if(trimmedLine.startsWith('"')) {
			keyMatch = trimmedLine.match(/^"(.*?)":(?: |$)/);
		}

		if(typeMatch) {
			type = typeMatch[1];
			trimmedLine = trimmedLine.replace(typeMatch[0], '');
		}

		if(keyMatch) {
			if(!object) object = {};

			key = keyMatch[1];
			value = trimmedLine.replace(keyMatch[0], '').trim();
		} else if(trimmedLine.startsWith('-')) {
			if(!object) object = [];
			value = trimmedLine.slice(1).trim();
		}

		if(value) {
			value = getValue(value, type);
		} else {
			value = getObject(lineGroup.nextGroup(), type);
		}

		if(Array.isArray(object)) {
			object.push(value);
		} else {
			object[key] = value;
		}
	}

	if(type) {
		object = {
			type: type,
			data: object
		};
	}

	return object;
}

function getValue(value, type) {
	value = JSON.parse(value);
	if(type) {
		value = {
			type: type,
			data: value
		};
	}

	return value;
}

function parse(str) {
	let lines = str.replace(/\t/g, '  ').split('\n');
	let lineGenerator = new LineGenerator(lines);

	return getObject(lineGenerator);
}

export {preStringify as stringifyYaml, parse as parseYaml};