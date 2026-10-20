// Code-heavy answer corpus. Each case: the exact code that must appear inside one rendered <pre><code>.
// Built so expected text is known independently of the app's Markdown library.
const longPy = '    result = some_function_with_a_long_name(argument_one, argument_two, argument_three, keyword_argument="value-that-keeps-going")';
const minified = 'var a=' + Array.from({ length: 220 }, (_, i) => `f${i}(x${i})`).join('+') + ';';
const bigLines = Array.from({ length: 1500 }, (_, i) => `    line_${String(i).padStart(4, '0')} = compute(${i}) if ${i} % 3 else None  # comment ${i}`);
const cases = [
  { id: 'py-indent', lang: 'python', code: 'def fib(n):\n    """Return n-th Fibonacci."""\n    if n < 2:\n        return n\n    a, b = 0, 1\n    for _ in range(n - 1):\n        a, b = b, a + b\n' + longPy + '\n    return b', pre: 'Here is a Python solution:' },
  { id: 'go-tabs', lang: 'go', code: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfor i := 0; i < 3; i++ {\n\t\tfmt.Println(i)\n\t}\n}', pre: 'Go uses tabs:' },
  { id: 'minified', lang: 'js', code: minified, pre: 'Minified one-liner:' },
  { id: 'html-entities', lang: 'html', code: '<!doctype html>\n<p class="x">Tom &amp; Jerry &lt;3 &copy; &#169;</p>\n<script>alert("not executed")</script>\n<img src=x onerror=alert(1)>', pre: 'HTML with entities and a script tag:' },
  { id: 'jsx', lang: 'jsx', code: 'export default function App({ items }) {\n  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;\n}', pre: 'React:' },
  { id: 'nested-fence', lang: 'markdown', fence: '````', code: '# Readme\n\n```bash\nnpm install\n```', pre: 'A README that itself contains a fence:' },
  { id: 'tilde-info', lang: 'python title="app.py"', fence: '~~~', code: 'print("tilde fence with info string")', pre: 'Tilde fence:' },
  { id: 'unicode', lang: 'text', code: '// 中文注释 and 日本語 コメント\nconst emoji = "🚀👩‍💻"; // ZWJ sequence\n// تعليق عربي (RTL)\nconst é = "é"; // combining\n┌──────┬──────┐\n│ col1 │ col2 │\n└──────┴──────┘', pre: 'Unicode and box drawing:' },
  { id: 'diff', lang: 'diff', code: '--- a/app.js\n+++ b/app.js\n@@ -1,3 +1,3 @@\n-const x = 1;   \n+const x = 2;\n context line', pre: 'A diff (note trailing spaces on the removed line):' },
  { id: 'shell', lang: 'bash', code: '# install deps (this hash is a comment, not a heading)\n$ npm install \\\n    --save-dev eslint\ncat <<EOF > file.txt\n*not italic* _not italic_ __init__\nEOF', pre: 'Shell:' },
  { id: 'blank-lines', lang: 'python', code: '\nimport os\n\n\n\nprint(os.getcwd())\n', pre: 'Leading and multiple blank lines:' },
  { id: 'no-blank-before', lang: 'js', code: 'console.log("fence directly after text");', pre: 'Here:', tight: true },
  { id: 'indented-fence', lang: 'js', indent: '   ', code: 'const indented = true;\nif (indented) {\n  run();\n}', pre: 'Fence indented by three spaces:' },
  { id: 'list-code', lang: 'python', list: true, code: 'for i in range(3):\n    print(i)', pre: '1. Step one, run this:' },
  { id: 'sql-wide', lang: 'sql', code: 'SELECT customer_id, first_name, last_name, email_address, phone_number, created_at, updated_at, lifetime_value FROM customers WHERE created_at > NOW() - INTERVAL \'30 days\' ORDER BY lifetime_value DESC;', pre: 'SQL:' },
  { id: 'big', lang: 'python', code: bigLines.join('\n'), pre: 'A 1500-line file:' }
];
function fenceCase(c) {
  const f = c.fence || '```'; const ind = c.indent || '';
  const body = c.code.split('\n').map(l => (c.list ? '   ' : ind) + l).join('\n');
  const open = (c.list ? '   ' : ind) + f + c.lang, close = (c.list ? '   ' : ind) + f;
  return `${c.pre}${c.tight ? '\n' : '\n\n'}${open}\n${body}\n${close}`;
}
function answer(selected = cases) {
  return '# Coding answer\n\nInline code with a very long identifier: `thisIsAnExtremelyLongIdentifierNameWithoutAnySpacesThatCouldOverflowTheCard_abcdefghijklmnopqrstuvwxyz0123456789`.\n\n| Option | Code | Notes |\n|---|---|---|\n| A | `useEffect(() => { fetchData(); return () => controller.abort(); }, [dependencyOne, dependencyTwo])` | long cell |\n| B | `x` | short |\n\n'
    + selected.map(fenceCase).join('\n\n') + '\n\nThat is all.';
}
module.exports = { cases, answer, fenceCase, minified, longPy };
