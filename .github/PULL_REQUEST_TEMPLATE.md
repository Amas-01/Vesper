# Pull Request

## Description

*Replace this text with a clear, concise summary of the changes in this PR.*

**Related Issue**: Closes #(issue number)

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update
- [ ] Chore / Refactor

## Changes Made

*List the main changes in bullet points:*

- Change 1
- Change 2
- Change 3

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] All tests passing locally (`npm run test` and `clarinet test`)

**Test Coverage:**
- [ ] 80%+ coverage for new code (contracts)
- [ ] 70%+ coverage for new code (frontend)
- [ ] No decrease in overall coverage

## Checklist

- [ ] Branch name follows convention: `type/short-description`
- [ ] Commits follow Conventional Commits format
- [ ] Code follows project style guide (ESLint, Prettier passing)
- [ ] `clarinet check` passes for Clarity code
- [ ] No console warnings or errors
- [ ] No hardcoded addresses or sensitive data
- [ ] No merge conflicts
- [ ] Documentation updated (README, docs, etc. if applicable)
- [ ] Self-review completed
- [ ] Requested reviewers assigned

## Contract Checklist (if applicable)

- [ ] All functions have appropriate access control (payer, recipient, DAO only)
- [ ] Events emitted for all state mutations
- [ ] Error handling and validation complete
- [ ] No reentrancy vulnerabilities
- [ ] Overflow/underflow protected
- [ ] Maps use composite keys where needed

## Frontend Checklist (if applicable)

- [ ] Components properly typed (TypeScript)
- [ ] responsive design verified
- [ ] Accessibility considered
- [ ] No console errors or warnings
- [ ] Wallet integration tested
- [ ] Error states handled

## Screenshots (if applicable)

*Add screenshots or GIFs for UI changes:*

## Notes for Reviewers

*Any context that would help reviewers understand the changes:*

---

### Conventional Commit Format Reminder

Commit messages should follow:
```
type(scope): short description

Longer explanation if needed.
Refs: #123
```

**Types**: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `style`, `ci`, `audit`
**Scopes**: `contract`, `frontend`, `scripts`, `docs`, `config`, `dao`, `tests`, `deploy`

**Example**:
```
feat(contract): add stream-create function with sBTC escrow

Implements the core streaming protocol with:
- Per-block withdrawal logic
- Escrow funds management
- Event emissions for indexing

Closes #45
```
