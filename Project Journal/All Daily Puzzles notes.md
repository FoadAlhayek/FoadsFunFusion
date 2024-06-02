Research papers and info regarding Sudoku puzzles:
- [ ] https://arxiv.org/pdf/1111.4083
- [ ] https://www.quora.com/What-is-the-least-amount-of-numbers-given-in-a-Sudoku-for-the-Sudoku-to-have-a-unique-solution
- [ ] Min amount of starting clues: 17
- [ ] Max amount of starting clues with more than 1 solution: 78
- [ ] Has to have one and only one solution

## Simple approaches 
Following approaches are the ones that came in mind without extra thought. A more nuanced approach is most likely needed.

### Elimination
1. Start from a random valid Sudoku
2. Randomly delete a number and check that it still has only one solution
3. Repeat until down to N clues, where N is: 17 <= N <= 78

### Addition
1. Start with an empty grid
2. Add randomly one valid number
3. Repeat until N clues exists
4. Check if there exists only one solution
5. If only one solution, done, otherwise start again from step 1