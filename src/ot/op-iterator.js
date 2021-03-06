// lifted from https://github.com/quilljs/delta/blob/master/lib/op.js
import { getOpLength } from './utils'

export default class OpIterator {
	constructor (ops) {
		this.ops = ops
		this.index = 0
		this.offset = 0
	}

	hasNext () {
		return this.peekLength() < Infinity
	}

	next (length) {
		if (!length) length = Infinity
		const nextOp = this.ops[this.index]
		if (!nextOp) {
			return { retain: Infinity }
		}

		const offset = this.offset
		const opLength = getOpLength(nextOp)
		if (length >= opLength - offset) {
			length = opLength - offset
			this.index++
			this.offset = 0
		} else {
			this.offset += length
		}
		if (typeof nextOp.delete === 'number') {
			return { delete: length }
		} else {
			const retOp = {}
			if (nextOp.attributes) {
				retOp.attributes = nextOp.attributes
			}
			if (typeof nextOp.retain === 'number') {
				retOp.retain = length
			}
			if (typeof nextOp.insert === 'string') {
				retOp.insert = nextOp.insert.substr(offset, length)
			}
			return retOp
		}
	}

	peek () {
		return this.ops[this.index]
	}

	peekLength () {
		if (this.ops[this.index]) {
			return getOpLength(this.ops[this.index]) - this.offset
		}
		return Infinity
	}

	peekType () {
		if (this.ops[this.index]) {
			if (typeof this.ops[this.index]['delete'] === 'number') {
				return 'delete'
			} else if (typeof this.ops[this.index].retain === 'number') {
				return 'retain'
			} else {
				return 'insert'
			}
		}
		return 'retain'
	}
}
