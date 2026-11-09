(function (root) {
  "use strict";

  function compileError(message) {
    var error = new Error(message);
    error.name = "CCompileError";
    return error;
  }

  function tokenize(source) {
    var tokens = [];
    var index = 0;
    var line = 1;
    var column = 1;

    function advance() {
      var character = source.charAt(index);
      index++;
      if (character === "\n") {
        line++;
        column = 1;
      } else {
        column++;
      }
      return character;
    }

    function add(type, value, tokenLine, tokenColumn) {
      tokens.push({
        type: type,
        value: value,
        line: tokenLine,
        column: tokenColumn
      });
    }

    while (index < source.length) {
      var character = source.charAt(index);
      var tokenLine = line;
      var tokenColumn = column;

      if (/\s/.test(character)) {
        advance();
      } else if (character === "/" && source.charAt(index + 1) === "/") {
        while (index < source.length && advance() !== "\n") {}
      } else if (character === "/" && source.charAt(index + 1) === "*") {
        advance();
        advance();
        while (index < source.length &&
            !(source.charAt(index) === "*" && source.charAt(index + 1) === "/")) {
          advance();
        }
        if (index >= source.length) {
          throw compileError("line " + tokenLine + ", column " + tokenColumn + ": unterminated comment");
        }
        advance();
        advance();
      } else if (/[A-Za-z_]/.test(character)) {
        var identifier = "";
        while (index < source.length && /[A-Za-z0-9_]/.test(source.charAt(index))) {
          identifier += advance();
        }
        add("identifier", identifier, tokenLine, tokenColumn);
      } else if (/[0-9]/.test(character)) {
        var number = "";
        if (character === "0" && /[xX]/.test(source.charAt(index + 1))) {
          number += advance() + advance();
          while (index < source.length && /[0-9a-fA-F]/.test(source.charAt(index))) {
            number += advance();
          }
          if (number.length === 2) {
            throw compileError("line " + tokenLine + ", column " + tokenColumn + ": expected hexadecimal digits after 0x");
          }
        } else {
          while (index < source.length && /[0-9]/.test(source.charAt(index))) {
            number += advance();
          }
        }
        add("number", number, tokenLine, tokenColumn);
      } else {
        var pair = source.substr(index, 2);
        if (/^(==|!=|<=|>=|\+\+|--|\+=|-=)$/.test(pair)) {
          advance();
          advance();
          add("symbol", pair, tokenLine, tokenColumn);
        } else if ("{}();=+-<>".indexOf(character) !== -1) {
          advance();
          add("symbol", character, tokenLine, tokenColumn);
        } else {
          throw compileError("line " + line + ", column " + column + ": unexpected character " + character);
        }
      }
    }

    add("eof", "", line, column);
    return tokens;
  }

  function Parser(tokens) {
    var position = 0;
    var returnType;
    var variables = {};
    var variableList = [];

    function current() {
      return tokens[position];
    }

    function at(value) {
      return current().value === value;
    }

    function take() {
      var token = current();
      position++;
      return token;
    }

    function fail(message) {
      var token = current();
      throw compileError("line " + token.line + ", column " + token.column + ": " + message);
    }

    function expect(value) {
      if (!at(value)) {
        fail("expected '" + value + "'");
      }
      return take();
    }

    function expectIdentifier() {
      if (current().type !== "identifier") {
        fail("expected an identifier");
      }
      return take();
    }

    function parseProgram() {
      if (at("void") || at("int")) {
        returnType = take().value;
      } else {
        fail("start with void main() or int main()");
      }

      expect("main");
      expect("(");
      if (at("void")) {
        take();
      }
      expect(")");
      var body = parseBlock();
      if (current().type !== "eof") {
        fail("only one main function is supported");
      }
      return {
        body: body,
        variables: variableList
      };
    }

    function parseBlock() {
      expect("{");
      var statements = [];
      while (!at("}") && current().type !== "eof") {
        statements.push(parseStatement());
      }
      expect("}");
      return { type: "block", statements: statements };
    }

    function parseStatement() {
      if (at("{")) {
        return parseBlock();
      }
      if (at("unsigned")) {
        return parseDeclaration();
      }
      if (at("while")) {
        return parseWhile();
      }
      if (at("if")) {
        return parseIf();
      }
      if (at("return")) {
        take();
        var expression = at(";") ? null : parseExpression();
        if (returnType === "void" && expression) {
          fail("void main cannot return a value");
        }
        if (returnType === "int" && !expression) {
          fail("int main must return a byte value");
        }
        expect(";");
        return { type: "return", expression: expression };
      }
      if (current().type === "identifier") {
        var identifier = take();
        if (at("(")) {
          return parseIntrinsic(identifier);
        }
        return parseAssignment(identifier);
      }
      fail("expected a declaration or statement");
    }

    function parseDeclaration() {
      expect("unsigned");
      expect("char");
      var name = expectIdentifier().value;
      if (Object.prototype.hasOwnProperty.call(variables, name)) {
        fail("variable '" + name + "' is already declared");
      }
      if (variableList.length >= 0xd0) {
        fail("the program exceeds the 208-byte variable limit");
      }
      var variable = {
        symbol: "c_" + name,
        address: 0x10 + variableList.length
      };
      variables[name] = variable;
      variableList.push(variable);
      var initialValue;
      if (at("=")) {
        take();
        initialValue = parseExpression();
      } else {
        initialValue = [{ type: "number", value: 0 }];
      }
      expect(";");
      return { type: "declaration", variable: variable, expression: initialValue };
    }

    function parseAssignment(identifier) {
      var variable = findVariable(identifier);
      var operator = take().value;
      var expression;
      if (operator === "++" || operator === "--") {
        expect(";");
        return {
          type: "assignment",
          variable: variable,
          expression: [{ type: "variable", variable: variable }, {
            type: "operator",
            value: operator === "++" ? "+" : "-"
          }, { type: "number", value: 1 }]
        };
      }
      if (operator !== "=" && operator !== "+=" && operator !== "-=") {
        fail("expected '=', '+=', '-=', '++', or '--'");
      }
      expression = parseExpression();
      expect(";");
      if (operator === "+=" || operator === "-=") {
        expression.unshift({ type: "variable", variable: variable });
        expression.splice(1, 0, { type: "operator", value: operator.charAt(0) });
      }
      return { type: "assignment", variable: variable, expression: expression };
    }

    function parseIntrinsic(identifier) {
      if (identifier.value !== "pixel" && identifier.value !== "led") {
        fail("unsupported function '" + identifier.value + "'");
      }
      expect("(");
      var expression = parseExpression();
      expect(")");
      expect(";");
      return {
        type: "intrinsic",
        name: identifier.value,
        expression: expression
      };
    }

    function parseWhile() {
      take();
      expect("(");
      var condition = parseCondition();
      expect(")");
      return { type: "while", condition: condition, body: parseStatement() };
    }

    function parseIf() {
      take();
      expect("(");
      var condition = parseCondition();
      expect(")");
      var consequent = parseStatement();
      var alternate = null;
      if (at("else")) {
        take();
        alternate = parseStatement();
      }
      return {
        type: "if",
        condition: condition,
        consequent: consequent,
        alternate: alternate
      };
    }

    function parseCondition() {
      var identifier = expectIdentifier();
      var variable = findVariable(identifier);
      var operator = take().value;
      if (!/^(==|!=|<|<=|>|>=)$/.test(operator)) {
        fail("expected a comparison operator");
      }
      var token = current();
      if (token.type !== "number") {
        fail("compare a variable with an 8-bit integer");
      }
      take();
      var value = parseNumber(token);
      return { variable: variable, operator: operator, value: value };
    }

    function parseExpression() {
      var expression = [parseOperand()];
      while (at("+") || at("-")) {
        expression.push({ type: "operator", value: take().value });
        expression.push(parseOperand());
      }
      return expression;
    }

    function parseOperand() {
      var token = current();
      if (token.type === "number") {
        take();
        return { type: "number", value: parseNumber(token) };
      }
      if (token.type === "identifier") {
        take();
        return { type: "variable", variable: findVariable(token) };
      }
      fail("expected an 8-bit integer or variable");
    }

    function parseNumber(token) {
      var value = token.value.indexOf("0x") === 0 || token.value.indexOf("0X") === 0 ?
        parseInt(token.value.substr(2), 16) : parseInt(token.value, 10);
      if (value > 255) {
        throw compileError("line " + token.line + ", column " + token.column + ": values must fit in one byte (0-255)");
      }
      return value;
    }

    function findVariable(token) {
      var name = typeof token === "string" ? token : token.value;
      if (!Object.prototype.hasOwnProperty.call(variables, name)) {
        if (typeof token !== "string") {
          throw compileError("line " + token.line + ", column " + token.column + ": variable '" + name + "' must be declared first");
        }
        fail("variable '" + name + "' must be declared first");
      }
      return variables[name];
    }

    return {
      parseProgram: parseProgram
    };
  }

  function compile(source) {
    var program = new Parser(tokenize(source)).parseProgram();
    var output = [
      "; Generated from the 8-bit C teaching subset",
      "* = $0600",
      "main:"
    ];
    var nextLabel = 0;

    for (var variableIndex = 0; variableIndex < program.variables.length; variableIndex++) {
      var variable = program.variables[variableIndex];
      output.splice(1 + variableIndex, 0,
        "define " + variable.symbol + " $" + hexByte(variable.address));
    }

    function emit(line) {
      output.push("    " + line);
    }

    function newLabel(prefix) {
      var label = "__c_" + prefix + "_" + nextLabel;
      nextLabel++;
      return label;
    }

    function emitExpression(expression) {
      var first = expression[0];
      emit("LDA " + operand(first));
      for (var i = 1; i < expression.length; i += 2) {
        var operator = expression[i].value;
        var right = expression[i + 1];
        emit(operator === "+" ? "CLC" : "SEC");
        emit((operator === "+" ? "ADC " : "SBC ") + operand(right));
      }
    }

    function operand(item) {
      if (item.type === "number") {
        return "#$" + hexByte(item.value);
      }
      return item.variable.symbol;
    }

    function emitCondition(condition, trueLabel, falseLabel) {
      var variableName = condition.variable.symbol;
      var immediate = "#$" + hexByte(condition.value);
      emit("LDA " + variableName);
      emit("CMP " + immediate);
      if (condition.operator === "<") {
        emit("BCC " + trueLabel);
        emit("JMP " + falseLabel);
      } else if (condition.operator === ">=") {
        emit("BCS " + trueLabel);
        emit("JMP " + falseLabel);
      } else if (condition.operator === "==") {
        emit("BEQ " + trueLabel);
        emit("JMP " + falseLabel);
      } else if (condition.operator === "!=") {
        emit("BNE " + trueLabel);
        emit("JMP " + falseLabel);
      } else if (condition.operator === "<=") {
        emit("BCC " + trueLabel);
        emit("BEQ " + trueLabel);
        emit("JMP " + falseLabel);
      } else if (condition.operator === ">") {
        var localFalse = newLabel("condition_false");
        emit("BCC " + localFalse);
        emit("BEQ " + localFalse);
        emit("JMP " + trueLabel);
        output.push(localFalse + ":");
        emit("JMP " + falseLabel);
      }
      output.push(trueLabel + ":");
    }

    function emitStatement(statement) {
      var i;
      if (statement.type === "block") {
        for (i = 0; i < statement.statements.length; i++) {
          emitStatement(statement.statements[i]);
        }
      } else if (statement.type === "declaration" || statement.type === "assignment") {
        emitExpression(statement.expression);
        emit("STA " + statement.variable.symbol);
      } else if (statement.type === "intrinsic") {
        emitExpression(statement.expression);
        emit(statement.name === "pixel" ? "STA $0200" : "STA $00E0");
      } else if (statement.type === "while") {
        var loop = newLabel("while");
        var loopBody = newLabel("while_body");
        var loopEnd = newLabel("while_end");
        output.push(loop + ":");
        emitCondition(statement.condition, loopBody, loopEnd);
        emitStatement(statement.body);
        emit("JMP " + loop);
        output.push(loopEnd + ":");
      } else if (statement.type === "if") {
        var thenLabel = newLabel("if_body");
        var elseLabel = newLabel("if_else");
        var endLabel = newLabel("if_end");
        emitCondition(statement.condition, thenLabel, statement.alternate ? elseLabel : endLabel);
        emitStatement(statement.consequent);
        if (statement.alternate) {
          emit("JMP " + endLabel);
          output.push(elseLabel + ":");
          emitStatement(statement.alternate);
        }
        output.push(endLabel + ":");
      } else if (statement.type === "return") {
        if (statement.expression) {
          emitExpression(statement.expression);
        }
        emit("BRK");
      }
    }

    emitStatement(program.body);
    emit("BRK");
    return output.join("\n") + "\n";
  }

  function hexByte(value) {
    var hex = value.toString(16).toUpperCase();
    return hex.length < 2 ? "0" + hex : hex;
  }

  var compiler = { compile: compile };
  root.CCompiler = compiler;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = compiler;
  }
}(this));
