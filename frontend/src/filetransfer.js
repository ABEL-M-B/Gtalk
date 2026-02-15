// File chunking logic for large file transfer

// Splits a file or blob into fixed-size chunks.
// file: File or Blob object to split
// chunkSize: Size of each chunk in bytes (default: 1MB)
// Returns: Array of chunk objects {id, offset, size, data}


export function chunkFile(file,chunkSize = 1024*1024)
    {
        const chunks = [];
        let offset = 0;
        let id = 0;

        while (offset < file.size)
            {
                const end = Math.min(offset+chunkSize, file.size); // end positon finding

                const chunk = file.slice(offset,end);

                chunks.push(
                    {
                        id:id,
                        offset:offset,
                        size: end - offset,
                        data: chunk
                    }
                );

                offset  = end;
                id ++;
            }
            return chunks;
    }