# Pokédex Grid

A web page that shows Pokémon in a grid, using live data from the [PokéAPI](https://pokeapi.co). Built with plain HTML, CSS, and JavaScript, with no libraries or frameworks.

## Features

- Shows 20 Pokémon per page, laid out with CSS Grid
- Each card has the Pokémon's official artwork, name, and a button
- Clicking "Introduce yourself" shows the Pokémon's name and abilities, for example: "I am bulbasaur and I have overgrow and chlorophyll."
- Search box that filters the Pokémon on the current page by name
- Next and Previous buttons to page through every Pokémon
- Types, height, and weight on each card
- Cards tinted by the Pokémon's main type
- Hover effects, a loading message, and an error message if the API can't be reached
- Two-column layout on phones

## How to run

No install or build step is needed. Download or clone the repo, then open `index.html` in a browser. An internet connection is required, since the data comes from the PokéAPI.

## How it works

1. `loadPage()` fetches the list of 20 Pokémon from `https://pokeapi.co/api/v2/pokemon?limit=20&offset=0`.
2. It then fetches each Pokémon's details at the same time with `Promise.all`.
3. `simplify()` keeps only the fields the page needs: id, name, image, types, abilities, height, and weight.
4. `renderCards()` builds the cards and filters them by the search box. Searching uses the data already loaded, so it never calls the API on each keystroke.
5. Next and Previous change the `offset` by 20 and load the new page.

## Files

- `index.html` contains the page structure
- `style.css` contains the layout, type colors, and mobile styles
- `script.js` contains the data fetching, cards, search, and pagination

## Credits

Pokémon data and images come from [PokéAPI](https://pokeapi.co). Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK inc.
