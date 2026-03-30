function openMessageDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('messageDB', 1);
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('messages')) 
            {
            const store = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
            store.createIndex('chatId', 'chatId', { unique: false });
            store.createIndex('chatId_timestamp', ['chatId', 'timestamp'], { unique: false });
            };
    }
         request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function messageExists(chatId, _id)
    {
        if (!_id)
            {
                return false;
            }
        const db = await openMessageDB();
        return new Promise((resolve, reject) =>{
            const tx = db.transaction('messages', 'readonly');
            const store = tx.objectStore('messages');
            //use a cursor to iterate over the indexedb for _id
            const request = store.openCursor();
            request.onsuccess = (event) =>{
                const cursor = event.target.result;
                if (cursor)
                    {
                        if(cursor.value.chatId === chatId && cursor.value._id === _id)
                            {
                                resolve(true);
                            }
                        else 
                        {
                            cursor.continue()   
                        }
                    }
                else
                    {
                        resolve(false);
                    }
                
            };
            request.onerror = () => reject(request.error);
        })
    }



export async function storeMessage(chatId, messages)
    {
        const db  = await openMessageDB();

        const existingIds = await new Promise((resolve, reject) => {
            const readTx = db.transaction('messages', 'readonly');
            const readStore = readTx.objectStore('messages');
            const request = readStore.openCursor();
            const ids = new Set();

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor)
                    {
                        const row = cursor.value;
                        if (row.chatId === chatId && row._id)
                            {
                                ids.add(String(row._id));
                            }
                        cursor.continue();
                    }
                else
                    {
                        resolve(ids);
                    }
            };

            request.onerror = () => reject(request.error);
        });

        return new Promise((resolve, reject) => {
            const tx = db.transaction('messages', 'readwrite');
            const store = tx.objectStore('messages');

            for(const msg of (messages || []))
                {
                    const hasId = !!msg._id;
                    const key = hasId ? String(msg._id) : null;
                    const exists = hasId && existingIds.has(key);

                    if (!exists)
                        {
                            store.put({...msg, chatId});
                            if (hasId)
                                {
                                    existingIds.add(key);
                                }
                        }
                }

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }


export async function getMessages(chatId)
    {
        const db = await openMessageDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction('messages', 'readonly');
                const store = tx.objectStore('messages');
                const index = store.index('chatId');
                const request = index.getAll(IDBKeyRange.only(chatId));
                request.onsuccess = () => 
                    {
                        const sorted = (request.result || []).sort((a, b) => new Date(a.timestamp) -new Date (b.timestamp));
                        resolve(sorted);
                    };
                request.onerror = () => reject(request.error);
                   
            });
    }
