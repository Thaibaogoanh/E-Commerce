import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session, QueryResult } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver: Driver;
  private logger = new Logger(Neo4jService.name);
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get<string>(
      'NEO4J_URI',
      'bolt://localhost:7687',
    );
    const username = this.configService.get<string>('NEO4J_USER', 'neo4j');
    const password = this.configService.get<string>('NEO4J_PASSWORD');

    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password || ''));

    try {
      await this.driver.verifyConnectivity();
      this.isConnected = true;
      this.logger.log('✅ Neo4j connection successful');
    } catch (error) {
      this.isConnected = false;
      this.logger.warn(
        '⚠️ Neo4j unavailable. Recommendations will be disabled.',
      );
      this.logger.warn('Error details:', (error as Error).message);
    }
  }

  async onModuleDestroy() {
    if (this.driver) {
      await this.driver.close();
      this.logger.log('Neo4j connection closed');
    }
  }

  getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized');
    }
    return this.driver.session();
  }

  getDriver(): Driver {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized');
    }
    return this.driver;
  }

  isReady(): boolean {
    return this.isConnected && !!this.driver;
  }

  /**
   * Execute Cypher query
   */
  async executeQuery(query: string, params: any = {}): Promise<QueryResult> {
    if (!this.isConnected) {
      throw new Error('Neo4j is not connected');
    }
    const session = this.getSession();
    try {
      return await session.run(query, params);
    } finally {
      await session.close();
    }
  }

  /**
   * Create or merge product node
   */
  async createProduct(
    productId: string,
    name: string,
    categoryId: string,
    price: number,
    rating: number,
  ): Promise<void> {
    const query = `
      MERGE (p:Product {id: $productId})
      SET p.name = $name,
          p.categoryId = $categoryId,
          p.price = $price,
          p.rating = $rating,
          p.updatedAt = datetime()
      RETURN p
    `;
    await this.executeQuery(query, {
      productId,
      name,
      categoryId,
      price,
      rating,
    });
  }

  /**
   * Create category node
   */
  async createCategory(categoryId: string, name: string): Promise<void> {
    const query = `
      MERGE (c:Category {id: $categoryId})
      SET c.name = $name
      RETURN c
    `;
    await this.executeQuery(query, { categoryId, name });
  }

  /**
   * Create relationship: Product belongs to Category
   */
  async linkProductToCategory(
    productId: string,
    categoryId: string,
  ): Promise<void> {
    const query = `
      MATCH (p:Product {id: $productId})
      MATCH (c:Category {id: $categoryId})
      MERGE (p)-[:BELONGS_TO]->(c)
    `;
    await this.executeQuery(query, { productId, categoryId });
  }

  /**
   * Create User purchased Product relationship
   */
  async createPurchaseRelationship(
    userId: string,
    productId: string,
    quantity: number,
    rating: number = 0,
  ): Promise<void> {
    const query = `
      MERGE (u:User {id: $userId})
      MERGE (p:Product {id: $productId})
      MERGE (u)-[rel:PURCHASED]->(p)
      SET rel.quantity = $quantity,
          rel.rating = $rating,
          rel.purchasedAt = datetime()
      RETURN rel
    `;
    await this.executeQuery(query, { userId, productId, quantity, rating });
  }

  /**
   * Create User viewed/interested Product relationship (when adding to cart)
   */
  async createViewedRelationship(
    userId: string,
    productId: string,
  ): Promise<void> {
    const query = `
      MERGE (u:User {id: $userId})
      MERGE (p:Product {id: $productId})
      MERGE (u)-[rel:VIEWED]->(p)
      ON CREATE SET rel.viewedAt = datetime(), rel.viewCount = 1
      ON MATCH SET rel.viewCount = COALESCE(rel.viewCount, 0) + 1,
                   rel.lastViewedAt = datetime()
      RETURN rel
    `;
    await this.executeQuery(query, { userId, productId });
  }

  /**
   * Create co-purchase relationship (products bought together)
   */
  async createCoPurchaseRelationship(
    productId1: string,
    productId2: string,
    coCount: number = 1,
  ): Promise<void> {
    if (productId1 === productId2) return; // Skip self-relationships

    const query = `
      MATCH (p1:Product {id: $productId1})
      MATCH (p2:Product {id: $productId2})
      MERGE (p1)-[rel:OFTEN_BOUGHT_WITH]->(p2)
      SET rel.count = COALESCE(rel.count, 0) + $coCount
      RETURN rel
    `;
    await this.executeQuery(query, { productId1, productId2, coCount });
  }

  /**
   * Create similarity relationship based on category
   */
  async createCategorySimilarityRelationship(
    productId1: string,
    productId2: string,
  ): Promise<void> {
    if (productId1 === productId2) return;

    const query = `
      MATCH (p1:Product {id: $productId1})-[:BELONGS_TO]->(c:Category)<-[:BELONGS_TO]-(p2:Product {id: $productId2})
      MERGE (p1)-[rel:SIMILAR_CATEGORY]->(p2)
      SET rel.createdAt = datetime()
      RETURN rel
    `;
    await this.executeQuery(query, { productId1, productId2 });
  }

  /**
   * Get similar products (by category + rating + price range)
   */
  async getSimilarProducts(
    productId: string,
    limit: number = 5,
  ): Promise<any[]> {
    const limitInt = Math.floor(Number(limit)) || 5;
    const query = `
      MATCH (p:Product {id: $productId})-[:BELONGS_TO]->(c:Category)<-[:BELONGS_TO]-(similar:Product)
      WHERE p.id <> similar.id
      RETURN similar.id as id, similar.name as name, similar.rating as rating, 
             similar.price as price, similar.categoryId as categoryId,
             abs(p.price - similar.price) as priceDiff
      ORDER BY similar.rating DESC, priceDiff ASC
      LIMIT $limit
    `;
    const result = await this.executeQuery(query, { productId, limit: neo4j.int(limitInt) });
    return result.records.map((record) => ({
      id: record.get('id'),
      name: record.get('name'),
      rating: record.get('rating'),
      price: record.get('price'),
      categoryId: record.get('categoryId'),
    }));
  }

  /**
   * Get products frequently bought together
   */
  async getFrequentlyBoughtTogether(
    productId: string,
    limit: number = 5,
  ): Promise<any[]> {
    const limitInt = Math.floor(Number(limit)) || 5;
    const query = `
      MATCH (p:Product {id: $productId})-[rel:OFTEN_BOUGHT_WITH]->(bought:Product)
      RETURN bought.id as id, bought.name as name, bought.rating as rating,
             bought.price as price, rel.count as buyCount
      ORDER BY rel.count DESC, bought.rating DESC
      LIMIT $limit
    `;
    const result = await this.executeQuery(query, { productId, limit: neo4j.int(limitInt) });
    return result.records.map((record) => ({
      id: record.get('id'),
      name: record.get('name'),
      rating: record.get('rating'),
      price: record.get('price'),
      buyCount: record.get('buyCount')?.toNumber() || 0,
    }));
  }

  /**
   * Get recommended products for a user based on purchase history
   */
  async getRecommendedProducts(
    userId: string,
    limit: number = 5,
  ): Promise<any[]> {
    const limitInt = Math.floor(Number(limit)) || 5;
    const query = `
      MATCH (u:User {id: $userId})-[:PURCHASED]->(p:Product)
      MATCH (p)-[:OFTEN_BOUGHT_WITH]->(recommended:Product)
      WHERE NOT (u)-[:PURCHASED]->(recommended)
      RETURN recommended.id as id, recommended.name as name, 
             recommended.rating as rating, recommended.price as price,
             COUNT(DISTINCT p) as matchCount
      ORDER BY matchCount DESC, recommended.rating DESC
      LIMIT $limit
    `;
    const result = await this.executeQuery(query, { userId, limit: neo4j.int(limitInt) });
    return result.records.map((record) => ({
      id: record.get('id'),
      name: record.get('name'),
      rating: record.get('rating'),
      price: record.get('price'),
      matchCount: record.get('matchCount')?.toNumber() || 0,
    }));
  }

  /**
   * Create or merge design node
   */
  async createDesignNode(
    designId: string,
    title: string,
    categoryId: string,
    likes: number = 0,
    downloads: number = 0,
  ): Promise<void> {
    const query = `
      MERGE (d:Design {id: $designId})
      SET d.title = $title,
          d.categoryId = $categoryId,
          d.likes = $likes,
          d.downloads = $downloads,
          d.updatedAt = datetime()
      RETURN d
    `;
    await this.executeQuery(query, {
      designId,
      title,
      categoryId,
      likes,
      downloads,
    });
  }

  /**
   * Create User viewed/interested Design relationship
   */
  async createDesignViewedRelationship(
    userId: string,
    designId: string,
  ): Promise<void> {
    const query = `
      MERGE (u:User {id: $userId})
      MERGE (d:Design {id: $designId})
      MERGE (u)-[rel:VIEWED_DESIGN]->(d)
      ON CREATE SET rel.viewedAt = datetime(), rel.viewCount = 1
      ON MATCH SET rel.viewCount = COALESCE(rel.viewCount, 0) + 1,
                   rel.lastViewedAt = datetime()
      RETURN rel
    `;
    await this.executeQuery(query, { userId, designId });
  }

  /**
   * Create User used Design relationship (when adding to customizer)
   */
  async createDesignUsedRelationship(
    userId: string,
    designId: string,
  ): Promise<void> {
    const query = `
      MERGE (u:User {id: $userId})
      MERGE (d:Design {id: $designId})
      MERGE (u)-[rel:USED_DESIGN]->(d)
      ON CREATE SET rel.usedAt = datetime(), rel.useCount = 1
      ON MATCH SET rel.useCount = COALESCE(rel.useCount, 0) + 1,
                   rel.lastUsedAt = datetime()
      RETURN rel
    `;
    await this.executeQuery(query, { userId, designId });
  }

  /**
   * Get recommended designs for a user based on interactions
   */
  async getRecommendedDesigns(
    userId: string,
    limit: number = 5,
  ): Promise<any[]> {
    const limitInt = Math.floor(Number(limit)) || 5;
    const query = `
      MATCH (u:User {id: $userId})-[:USED_DESIGN]->(used:Design)
      MATCH (other:User)-[:USED_DESIGN]->(used)
      MATCH (other)-[:USED_DESIGN]->(recommended:Design)
      WHERE NOT (u)-[:USED_DESIGN]->(recommended) AND recommended.id <> used.id
      RETURN recommended.id as id, recommended.title as title, 
             recommended.likes as likes, recommended.downloads as downloads,
             COUNT(DISTINCT other) as matchCount
      ORDER BY matchCount DESC, recommended.likes DESC, recommended.downloads DESC
      LIMIT $limit
    `;
    const result = await this.executeQuery(query, {
      userId,
      limit: neo4j.int(limitInt),
    });
    return result.records.map((record) => ({
      id: record.get('id'),
      title: record.get('title'),
      likes: record.get('likes')?.toNumber() || 0,
      downloads: record.get('downloads')?.toNumber() || 0,
      matchCount: record.get('matchCount')?.toNumber() || 0,
    }));
  }

  /**
   * Get trending products (high rating + many purchases)
   */
  async getTrendingProducts(limit: number = 5): Promise<any[]> {
    const limitInt = Math.floor(Number(limit)) || 5;
    const query = `
      MATCH (u:User)-[rel:PURCHASED]->(p:Product)
      RETURN p.id as id, p.name as name, p.rating as rating, p.price as price,
             COUNT(DISTINCT u) as purchaseCount
      WHERE p.rating >= 3.5
      ORDER BY p.rating DESC, purchaseCount DESC
      LIMIT $limit
    `;
    const result = await this.executeQuery(query, { limit: neo4j.int(limitInt) });
    return result.records.map((record) => ({
      id: record.get('id'),
      name: record.get('name'),
      rating: record.get('rating'),
      price: record.get('price'),
      purchaseCount: record.get('purchaseCount')?.toNumber() || 0,
    }));
  }

  /**
   * Clear all nodes and relationships
   */
  async clearGraph(): Promise<void> {
    const query = 'MATCH (n) DETACH DELETE n';
    await this.executeQuery(query);
    this.logger.log('Neo4j graph cleared');
  }
}
