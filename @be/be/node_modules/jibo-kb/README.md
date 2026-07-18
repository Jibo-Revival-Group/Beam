# jibo-kb

Jibo Knowledge Base API

## Installation

Install using NPM.

```bash
yarn install jibo-kb --save
```

## Usage

To initialize the Jibo KB API:

```
import classes from 'jibo-kb';
const kb = new classes.KnowledgeBase();
kb.init(serviceObject, callback);
```

Normally pre-attached and pre-inited and available on the `jibo` global
object as `jibo.kb`.
