import { tokenize, buildAST, evaluate, run } from './lisp'

/*
const tokens = tokenize("(+ 1 2)")
const parsed = parse(tokens)
console.log(JSON.stringify(parsed))
*/

const example2 = `
(
  + 1 (
    + 3 4
  )
)`

const example3 = `
(
    + 1 (
        + 2 (
          + 3 4    
        )
    )
)`

const example4 = `
(
    begin (
        + 1 2
    )
    (
        + 3 4
    )
)
`

const example5 = `
(
    begin (
        def x 1
    )
    (
        + 3 x
    )
)
`

const example6 = `
(
    begin (
        def x 123
    )
    (
        + 3.2 x
    )
)
`
const example7 = `
(
    (
        def x 123
    )
    (
        + 3.2 x
    )
)
`

/*
const tokens2 = tokenize(example5);
console.log("Tokens2", tokens2);
const parsed2 = getAST(tokens2)
console.log(JSON.stringify(parsed2, null, 2))
console.log(evaluate(parsed2))
*/

const tokens = tokenize(example7)
        .map(token => token.token);
console.log(tokens);
const ast = buildAST(tokens);
console.log(ast);
console.log(evaluate(ast))

console.log(run(example7))