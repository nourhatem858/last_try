/**
 * Search Service
 * Handles indexing and searching of documents, notes, and other resources
 * Uses in-memory index for now, can be replaced with Meilisearch/Elasticsearch
 */

import mongoose from 'mongoose';

export interface SearchableDocument {
  id: string;
  type: 'document' | 'note' | 'workspace' | 'chat';
  title: string;
  content: string;
  workspaceId?: string;
  userId: string;
  tags?: string[];
  createdAt: Date;
}

class SearchService {
  private index: Map<string, SearchableDocument> = new Map();

  /**
   * Index a document for search
   */
  async indexDocument(doc: SearchableDocument): Promise<void> {
    try {
      const key = `${doc.type}:${doc.id}`;
      this.index.set(key, doc);
      console.log(`✅ Indexed ${doc.type}: ${doc.title}`);
    } catch (error) {
      console.error('Search indexing error:', error);
    }
  }

  /**
   * Remove document from index
   */
  async removeDocument(type: string, id: string): Promise<void> {
    const key = `${type}:${id}`;
    this.index.delete(key);
    console.log(`🗑️ Removed from index: ${key}`);
  }

  /**
   * Delete document from index (alias for removeDocument)
   */
  async deleteDocument(id: string): Promise<void> {
    await this.removeDocument('document', id);
  }

  /**
   * Search across all indexed documents
   */
  async search(query: string, userId: string, filters?: {
    type?: string;
    workspaceId?: string;
  }): Promise<SearchableDocument[]> {
    const lowerQuery = query.toLowerCase();
    const results: SearchableDocument[] = [];

    for (const doc of this.index.values()) {
      // Filter by user
      if (doc.userId !== userId) continue;

      // Apply filters
      if (filters?.type && doc.type !== filters.type) continue;
      if (filters?.workspaceId && doc.workspaceId !== filters.workspaceId) continue;

      // Search in title and content
      const titleMatch = doc.title.toLowerCase().includes(lowerQuery);
      const contentMatch = doc.content.toLowerCase().includes(lowerQuery);
      const tagMatch = doc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));

      if (titleMatch || contentMatch || tagMatch) {
        results.push(doc);
      }
    }

    return results;
  }

  /**
   * Get index statistics
   */
  getStats(): { total: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    
    for (const doc of this.index.values()) {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
    }

    return {
      total: this.index.size,
      byType,
    };
  }
}

export const searchService = new SearchService();
