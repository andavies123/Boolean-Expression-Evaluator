const expressionInput = document.querySelector('#expression_input');
const calculateBtn = document.querySelector('#calculate_button');

calculateBtn.addEventListener('click', e=> {
    parseFunction(expressionInput.value.replace(/\s/g, ""));
})

var stack;
var identifiers;
var postfixExpression;

var precNOT = 1;
var precAND = 2;
var precOR = 3;

function parseFunction(expression) {
    stack = [];
    identifiers = [];
    postfixExpression = "";
    convertToPostfix(expression);
    console.log('stack: ' + stack);
    console.log('identifiers: ' + identifiers);
    console.log('newExpression: ' + postfixExpression);
    stack = [];
    evaluatePostfix(postfixExpression, 0, []);
}

function convertToPostfix(expression) {
    for(i = 0; i < expression.length; i++) {
        evaluateToken(expression.charAt(i));
    }
    while(stack.length !== 0) {
        postfixExpression += stack.pop();
    }
}

function evaluateToken(token) {
    console.log(stack);
    if(token === '(')
        stack.push(token);
    else if(token === ')') {
        while(stack.length > 0) {
            var currentToken = stack.pop();
            if(currentToken === '(')
                break;
            else
                postfixExpression += currentToken;
        }
    }
    else if(token === '&' || token === '|' || token === '!')
        evaluateOperand(token);

    else if(isLetter(token) && !identifiers.includes(token)) {
        identifiers.push(token);
        postfixExpression += token;
    }
    else if(isLetter(token) && identifiers.includes(token)) {
        postfixExpression += token;
    }
}

function evaluateOperand(operand) {
    var operandPrec = getOperandPrecedence(operand);
    if(stack.length === 0 || stack[stack.length - 1] === '(' || operandPrec < getOperandPrecedence(stack[stack.length - 1])) {
        stack.push(operand);
    }
    else {
        postfixExpression += stack.pop();
        evaluateOperand(operand);
    }
}

function getOperandPrecedence(operand) {
    if(operand == '&')
        return precAND;
    else if(operand == '|')
        return precOR;
    else if(operand === '!')
        return precNOT;
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function evaluatePostfix(postfixExpression, index, currentIter) {
    if(index >= currentIter.length)
        currentIter.push(false);
    else
        currentIter[index] = false;
    if(index < identifiers.length - 1)
        evaluatePostfix(postfixExpression, index + 1, currentIter);
    else if(index === identifiers.length - 1)
        evaluateExpression(postfixExpression, currentIter);
    currentIter[index] = true;
    if(index < identifiers.length - 1)
        evaluatePostfix(postfixExpression, index + 1, currentIter);
    else if(index === identifiers.length - 1)
        evaluateExpression(postfixExpression, currentIter);
}

function evaluateExpression(postfixExpression, currentIter) {
    var stack = [];
    for(i = 0; i < postfixExpression.length; i++) {
        var token = postfixExpression.charAt(i);
        var index = identifiers.indexOf(token);
        if(index === -1) {
            if(token === '!')
                stack.push(!stack.pop());
            else
                stack.push(evalOperand(token, stack.pop(), stack.pop()))
        }
        else {
            stack.push(currentIter[index]);
        }
    }
    console.log(stack);
}

function evalOperand(op, token1, token2) {
    if(op === '&')
        return token1 && token2;
    else if(op === '|')
        return token1 || token2;
}