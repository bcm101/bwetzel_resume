

import textFiles from './text_files.json'
import maze_maker from './maze_maker';
import word_search_maker from './word_search_maker';

export default function(path) {
    const text = textFiles[path];
    if(text)
        return text;
    else{
        if(path === '~/Projects/maze_maker.html') return maze_maker;
        if(path === '~/Projects/word_search_maker.html') return word_search_maker;
    }
}



