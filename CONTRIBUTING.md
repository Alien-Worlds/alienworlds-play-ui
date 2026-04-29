# Contributing to Alien Worlds Game UI

We love your input! We want to make contributing to Alien Worlds Game UI as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with GitHub
We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://docs.github.com/en/get-started/using-github/github-flow)
Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Process
1. Clone the repository
2. Install dependencies with `yarn install`
3. Create a new branch for your feature/fix
4. Make your changes
5. Submit a pull request

## Project Structure
```
src/
├── assets/         # Images, icons, etc.
├── components/      # Reusable UI components
├── pages/          # Route components
├── routes/         # Route Index
├── state/          # Overmind state management
├── hooks/          # Custom React hooks
├── api/            # Apollo queries and mutations
├── utils/          # Helper functions
├── types/          # TypeScript type definitions
├── constants/      # Global constants
├── theme/          # Chakra UI theme customization
└── config/         # Environment configurations
```

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/Alien-Worlds/game-ui/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/Alien-Worlds/game-ui/issues/new/choose).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Use a Consistent Coding Style

* Use TypeScript for type safety
* 2 spaces for indentation rather than tabs
* You can try running `yarn lint` for style unification

## License
By contributing, you agree that your contributions will be licensed under its MIT License. 