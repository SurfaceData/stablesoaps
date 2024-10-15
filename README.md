## What is Stable Soaps?

TBD!

## Silly Ideas

### Character Themed Soaps

Take a given story and extract all the interesting scenes for the major
characters.  Then for each base oil soap recipe, associate it with a given
character.  For each batch of soap, sample (or move forward) a scene involving
the character and use the essential oil blend to then pick the thematic style
for the eventual image to generate.

This can probably be made pretty cheaply by mixing together a few related features:
*  [Prompt
   Caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching):
use this to cache large blocks of raw story text we'll use to extract character
and scene information.
*  [Message
   Batches](https://docs.anthropic.com/en/docs/build-with-claude/message-batches):
Use this to batch generate lots of image generation prompts for a set of soaps.
*  Function Calling to ensure we get properly formed JSON with everything that
   comes out.
