const rules = [
    { type: 'space', regex: /^\s/ },
    { type: 'lParen', regex: /^\(/ },
    { type: 'rParen', regex: /^\)/ },
    { type: 'number', regex: /^[0-9\.]+/ },
    { type: 'string', regex: /^".*?"/ },
    { type: 'variable', regex: /^[^\s\(\)]+/ }
  ];

function extractToken(input: string) {
    for(const rule of rules) {
        const token = rule.regex.exec(input)?.[0];
        if (token) {
            return {
              token,
              type: rule.type,
            };
        }
    }
    throw Error("Unable to extract token");
}

export function tokenize(codeListing: string, currentTokens: any[] = []) {
    if(codeListing.length === 0) {
        return currentTokens;
    }

    const result = extractToken(codeListing);

    if(result.type !== 'space') {
        currentTokens.push(result);
    }
    const remainder = codeListing.slice(result.token.length);
   
    return tokenize(remainder, currentTokens);
}

export function buildAST(tokens: string[]) {
    return parseTokens({tokens, ast:[]}).ast[0];
}

export function parseTokens({tokens, ast}) {
    let [current, ...remainder] = tokens
   
    if(!current) {
       return {tokens, ast}
    }
    if(current === ")") {
        return {tokens:remainder, ast}
    }
    if(current === "(") {
        const subParse = parseTokens({tokens:remainder, ast:[]});
        current = subParse.ast;
        remainder = subParse.tokens;
    }

    ast.push(convertValue(current))

    return parseTokens({tokens:remainder, ast})
}



function begin(...args: any[]) {
    return args.pop();
}

function def(name, value) {
    globals[name] = value;
}

const globals = {
    "+" : (a, b) => a + b,
    "-" : (a, b) => a - b,
    begin,
    def
}

function convertValue(unknown: string) {
    const num = Number(unknown);
    if(!isNaN(num)){
        return num
    }
    return unknown;
}

export function run(program: string) {
    const tokens = tokenize(program)
        .map(token => token.token);
    const ast = buildAST(tokens);
    const result = evaluate(ast);
    return result.pop();
}

export function evaluate(AST: any[]) {
    const [func, ...vals] = AST.map(e => {
        if(Array.isArray(e)) {
         return evaluate(e)
        }
        if(globals.hasOwnProperty(e)) {
            return globals[e]
        }
        return e
    });
    
    
    if(typeof func !== "function") {
       return [func, ...vals];
    }
    return func(...vals)
}
