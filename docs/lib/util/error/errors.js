// 代入禁止, 関数シグネチャ不一致
class AssignmentError extends Error { constructor(msg='Assignment prohibited.') { super(msg); this.name='AssignmentError' } }
class SignatureError extends Error { constructor(msg='One or more of the method name, argument type, number, order, or return value type does not match.') { super(msg); this.name='SignatureError' } }
class FalseError extends Error { constructor(msg='False.') { super(msg); this.name='InvalidError' } }
class ValueError extends Error { constructor(msg='Invalid value.') { super(msg); this.name='InvalidError' } }
//class InvalidError extends Error { constructor(msg='Invalid value.') { super(msg); this.name='InvalidError' } }

