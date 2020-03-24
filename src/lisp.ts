const rules = [
    { type: 'space', regex: /^\s/ },
    { type: 'lParen', regex: /^\(/ },
    { type: 'rParen', regex: /^\)/ },
    { type: 'number', regex: /^[0-9\.]+/ },
    { type: 'string', regex: /^".*?"/ },
    { type: 'variable', regex: /^[^\s\(\)]+/ } // take from the beginning 1+ characters until you hit a ' ', '(', or ')' // TODO - support escaped double quote
  ];
  
  
  const tokenizer = rules => input => {
    for (let i = 0; i < rules.length; i += 1) {
      let tokenized = rules[i].regex.exec(input);
      if (tokenized) {
        return {
          token: tokenized[0],
          type: rules[i].type,
          rest: input.slice(tokenized[0].length)
        };
      }
    }
  
    throw new Error(`no matching tokenize rule for ${JSON.stringify(input)}`);
  };

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

export function tokenize2(codeListing: string, currentTokens: any[]) {
    const result = extractToken(codeListing);

    if(result.type !== 'space') {
        currentTokens.push(result);
    }
    const remainder = codeListing.slice(result.token.length);
    if(remainder.length === 0) {
        return currentTokens;
    }

    return tokenize2(remainder, currentTokens);
}

export function tokenize(codeListing: string): string[] {
    return codeListing
        .replace(/\n/g,'')
        .replace(/\(/g, " ( ")
        .replace(/\)/g, " ) ")
        .split(' ')
        .filter(x => x !== '');
}

export function getAST(tokens: string[]) {
    return parse(tokens)[0][0];
}

export function parse(tokens: string[]): any[] {
    const [head, ...tail] = tokens

    if(!head) {
        console.log("EOF")
       return [[], []]
    }

    // Close the scope 
    if(head === ")") {
        const rval =  [[], tail];
        console.log("Close value", rval);
        return rval
    }

    const [currentSet, remainder] = parse(tail);

    // Open a new scope
    if(head === "(") {
        //Parse the rest
        const [currentSet2, remainder2] = parse(remainder);
        const rval = [
            [currentSet, ...currentSet2],
            remainder2
        ]
        console.log("Scope Open", rval)
        return rval
    }

    const rval = [
        [convertValue(head), ...currentSet], 
        remainder
    ]
    console.log("Standard", rval);
    return rval
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
        throw Error(`${AST[0]} is not a recognised function`)
    }
    return func(...vals)
}
