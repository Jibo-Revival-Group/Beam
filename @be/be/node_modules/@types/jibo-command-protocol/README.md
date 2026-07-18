# Jibo Remote Client Protocol

## Overview

The Remote client protocol has three main parts.

### Commands

These are the top level gets and sets of the command protocl. Commands are used to send down execution plans, get and set data on the robot.

### Behavior Trees

Behavior tree represent robot execution plans. They allow synchronized execution of graphics, animation, speech, sensors, and sound.

### Events

Events are streamed data that represent state change or user interaction. Events can either be global to the robot, or emitted by specific behaviors.

### Run

```
yarn install
yarn run schema
```

### Docs

To generate docs for the Jibo RCP, run:

```
yarn run docs
open docs/index.html
```
