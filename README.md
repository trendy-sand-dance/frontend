<div align=center>

# frontend
Bla bla

</div>


## Notes to self

- Don't forget to match :user when retrieving URL parameters



## Repo configuration
After you've created a repo based on this template you should setup the branch rules.
#### Use rebases instead of merges
1. In your repo go to `Settings -> General`, scroll down to `Pull Requests` and disable `Allow merge commits`.
2. In `Allow squash merging` set the `Default commit message` to `Pull request title`.

#### Only commit on main using PRs
1. Go to `Settings -> Rules -> Rulesets` and create a `New ruleset -> New branch ruleset` give it a name like "protect main"
2. The the `Enforcement status` to `Active`.
3. Scroll down to `Targets` `Add target -> Include default branch`.
4. Scroll further down to `Rules` and enable `Require a pull request before merging`.
5. Expand the `Additional settings` the set `Allowed merge methods` to **Squash** and **Rebase**.

#### Fix package not building
This is because after you fork github automagically disables any actions, in order to enable them just goto the `Actions` tab in the repo's homepage.

## Initial project setup
1. Set the name in `package.json` to the name of the service.


## dev pre-requisites
- docker



## Running in dev mode
- building the container
```
make devbuild
```

- running the container
```
make rundev
```

## Running in prod mode
- building the container
```
make prodbuild
```

- running the container
```
make runprod
```

## Cleaning the container
```
make clean
```

