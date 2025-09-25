// MongoDB connection utility
// Temporarily disabled to avoid build issues

export async function connectToDatabase() {
  // Mock database connection for now
  return {
    db: {
      collection: () => ({
        find: () => ({ sort: () => ({ toArray: () => [] }) }),
        findOne: () => null,
        insertOne: () => ({ insertedId: 'mock-id' }),
        deleteOne: () => ({ deletedCount: 1 }),
        deleteMany: () => ({ deletedCount: 0 })
      })
    },
    client: null
  };
}

export async function closeDatabase() {
  // Mock close
}