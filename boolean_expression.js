const expressionInput = document.querySelector('#expression_input');
const calculateBtn = document.querySelector('#calculate_button');

calculateBtn.addEventListener('click', e=> {
    createTruthTable(expressionInput.value.replace(/\s/g, ""));
});

var precedences = ['!', '&', '|'];

function createTruthTable(expression) {
    var returnVal = infixToPostfix(expression);
    var postfixExpression = returnVal[0];
    var variables = returnVal[1];
    var inputs = fillTruthTableInputs(variables, []);
    var outputs = evaluateExpression(postfixExpression, inputs, variables);
    createTable(variables, expression, inputs, outputs);
}

function infixToPostfix(expression) {
    var stack = [];
    var postfixExpression = "";
    var variables = [];

    for(var i = 0; i < expression.length; i++) {
        var returnVal = evaluateToken(expression.charAt(i), stack, postfixExpression, variables);
        stack = returnVal[0];
        postfixExpression = returnVal[1];
        variables = returnVal[2];
    }

    while(stack.length > 0) {
        postfixExpression += stack.pop();
    }
    return [postfixExpression, variables];
}

function evaluateToken(token, stack, postfixExpression, variables) {
    if(token === '(') {
        stack.push(token);
    }
    else if(token === ')') {
        while(stack.length > 0) {
            var currentToken = stack.pop();
            if(currentToken === '(')
                break;
            else
                postfixExpression += currentToken;
        }
    }
    else if(token === '!' || token === '&' || token === '|') {
        var returnVal = evaluateOperand(token, stack, postfixExpression);
        stack = returnVal[0];
        postfixExpression = returnVal[1];
    }
    else if(isLetter(token)) {
        if(!variables.includes(token))
            variables.push(token);
        postfixExpression += token;
    }
    return [stack, postfixExpression, variables];
}

function evaluateOperand(operand, stack, postfixExpression) {
    var operandPrecedence = precedences.indexOf(operand);

    if(stack.length === 0 || stack[stack.length - 1] === '(' || operandPrecedence < precedences.indexOf(stack[stack.length - 1])) {
        stack.push(operand);
        return [stack, postfixExpression];
    }
    else {
        postfixExpression += stack.pop();
        return evaluateOperand(operand, stack, postfixExpression);
    }
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function fillTruthTableInputs(variables, inputs) {
    for(var i = 0; i < Math.pow(2, variables.length); i++) {
        inputs.push(new Array(variables.length));
        var binaryStr = i.toString(2);
        while(binaryStr.length < variables.length)
            binaryStr = '0' + binaryStr;
        for(var index = 0; index < binaryStr.length; index++) {
            if(binaryStr.charAt(index) === '0')
                inputs[i][index] = false;
            else
                inputs[i][index] = true;
        }
    }
    return inputs;
}

function evaluateExpression(postfixExpression, inputs, variables) {
    console.log(postfixExpression);
    var outputs = [];
    for(var i = 0; i < inputs.length; i++) {

        var stack = [];
        for(var j = 0; j < postfixExpression.length; j++) {
            var token = postfixExpression.charAt(j);
            var varIndex = variables.indexOf(token);
            if(varIndex === -1) {
                if(token === '!')
                    stack.push(!stack.pop());
                else
                    stack.push(evaluateOperandToken(token, stack.pop(), stack.pop()));
            }
            else
                stack.push(inputs[i][varIndex]);
        }
        outputs.push(stack[0]);

    }
    return outputs;
}

function evaluateOperandToken(op, token1, token2) {
    if(op === '&')
        return token1 && token2;
    else if(op === '|')
        return token1 || token2;
}

function createTable(variables, expression, inputs, outputs) {
    var div = document.getElementById('truthTable');
    while(div.firstChild) {
        div.removeChild(div.firstChild);
    }

    var table = document.createElement("table");
    table.className = "truthTable";
    var thead = document.createElement("thead");
    var tbody = document.createElement("tbody");

    var tr = document.createElement("tr");
    for(const c of variables) {
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(c));
        tr.appendChild(td);
    }
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(expression));
    tr.appendChild(td);
    thead.appendChild(tr);

    for(var i = 0; i < inputs.length; i++) {
        var tr = document.createElement("tr");
        for(var j = 0; j < inputs[i].length; j++) {
            var td = document.createElement("td");
            td.appendChild(document.createTextNode(getBoolRepresentation(inputs[i][j])));
            tr.appendChild(td);
        }
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(getBoolRepresentation(outputs[i])));
        tr.appendChild(td);
        tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    document.getElementById("truthTable").appendChild(table);
}

function getBoolRepresentation(bool) {
    return (bool ? 'T' : 'F');
}