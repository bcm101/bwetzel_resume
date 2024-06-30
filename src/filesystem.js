// wrapper for the file system class I made, provides a method to guarentee consistentcy across all components

import FileSystem from './file_system';

const FS = new FileSystem();

export default function getFS() {
    return FS;
}

