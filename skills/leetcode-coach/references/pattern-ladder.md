# Pattern Ladder

Use this progression when the learner does not provide a custom roadmap. Stay on a pattern for 2-3 problems, then move on.

| Stage | Pattern | Typical question shapes | Core mental move | Move on when the learner can... |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Hash map / counting | Two Sum, contains duplicate, anagram | Trade space for fast lookup | spot "I need to know whether X already appeared" quickly |
| 2 | Two pointers | sorted pair, remove duplicates, palindrome | Shrink search space from both ends | explain pointer movement instead of brute force |
| 3 | Sliding window | longest substring, fixed-size window, frequency window | Maintain a valid range while moving once | say what the window invariant is |
| 4 | Binary search | search range, answer search, boundary search | Cut search space by monotonicity | distinguish "search value" vs "search answer" |
| 5 | Stack / monotonic stack | valid parentheses, next greater element, histogram | Defer work until a structural condition breaks | explain what stays monotonic and why |
| 6 | Linked list | reverse list, cycle, merge lists | Track pointers, not indexes | reason about pointer rewiring without hand-waving |
| 7 | Tree DFS / BFS | traversals, level order, path checks | Use recursive structure or queue order | choose DFS vs BFS for a stated reason |
| 8 | Backtracking | subsets, permutations, combination sum | Build path, recurse, undo choice | name decision tree, path, and pruning point |
| 9 | Heap / priority queue | top K, merge streams, scheduling | Keep only the most valuable candidates | justify min-heap vs max-heap |
| 10 | Graph traversal | islands, course schedule, shortest reach | Model state transitions explicitly | identify nodes, edges, and visited policy |
| 11 | Interval problems | merge intervals, meeting rooms | Sort first, then reason about overlap | state the merge condition clearly |
| 12 | Dynamic programming | stairs, knapsack, subsequence, partition | Define state and transition before coding | say state, choice, base case, transition without guessing |

## Selection Heuristics

- If the learner says "95% of LeetCode feels impossible", start with **hash map**, **two pointers**, or **sliding window**.
- If the learner keeps writing correct brute force first, stay on the same pattern until they can reach the optimized pattern themselves.
- If the learner memorizes templates but cannot explain invariants, do not advance yet.
- If the learner solves the code but cannot name the transfer cue, end the session with a pattern summary before moving on.

## Suggested Next-Step Pairs

| After this pattern | Good next pattern |
| :--- | :--- |
| Hash map | Two pointers |
| Two pointers | Sliding window |
| Sliding window | Binary search or stack |
| Tree DFS / BFS | Backtracking or graph traversal |
| Interval | Heap |
| Binary search | Dynamic programming only after monotonic thinking is stable |
