import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver: Driver;

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
      console.log('Neo4j connection successful');
    } catch (error) {
      console.error('Neo4j connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.driver) {
      await this.driver.close();
      console.log('Neo4j connection closed');
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
}
