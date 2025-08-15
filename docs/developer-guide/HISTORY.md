# History Implementation Guide for SciCat Backend

This guide provides developers with comprehensive instructions for implementing history tracking in new entities/modules within the SciCat backend.

## Overview

The SciCat backend includes a centralized history system that tracks changes to critical data entities. Currently implemented for:

- Dataset
- Proposal
- Sample
- Instrument
- PublishedData
- Policy
- Datablock
- Attachment

## Architecture

The history system consists of:

1. **Generic History Schema** (`src/common/schemas/generic-history.schema.ts`)
2. **History Plugin** (`src/common/mongoose/plugins/history.plugin.ts`)
3. **History Service** (`src/history/history.service.ts`)
4. **History Controller** (`src/history/history.controller.ts`)
5. **CASL Authorization** for history access control

## Authorization Model

The history module implements a two-layer authorization model consistent with the rest of the application:

### 1. Endpoint-Level Access

Controlled by `historyEndpointAccess()` in the CASL factory, this determines if a user has permission to use the history API endpoints at all. This is checked using:

```typescript
@CheckPolicies("history", (ability: AppAbility) =>
  ability.can(Action.HistoryReadEndpoint, "GenericHistory"),
)
```

### 2. Instance-Level Access

Controlled by `historyInstanceAccess()` in the CASL factory, this determines if a user has permission to access specific subsystem histories (Dataset, Proposal, etc.). This is checked for each specific history request:

```typescript
// Example from controller
const ability = this.caslFactory.historyInstanceAccess(request.user as JWTUser);
const requiredAction = this.subsystemActionMap[subsystem];
if (!requiredAction || !ability.can(requiredAction, "GenericHistory")) {
  throw new ForbiddenException(`No access to ${subsystem} history`);
}
```

Each subsystem has its own specific action permission (e.g., `Action.HistoryReadDataset`, `Action.HistoryReadProposal`).

## Step-by-Step Implementation Guide

### 1. Module Configuration

To add history tracking to a new entity, modify your module's `MongooseModule.forFeatureAsync` configuration:

```typescript
import { historyPlugin } from "../common/mongoose/plugins/history.plugin";
import {
  GenericHistory,
  GenericHistorySchema,
} from "../common/schemas/generic-history.schema";
import { getCurrentUsername } from "../common/utils/request-context.util";

@Module({
  imports: [
    CaslModule,
    ConfigModule,
    // Import the GenericHistory schema
    MongooseModule.forFeature([
      {
        name: GenericHistory.name,
        schema: GenericHistorySchema,
      },
    ]),
    // Configure your entity with history plugin
    MongooseModule.forFeatureAsync([
      {
        name: YourEntity.name,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = YourEntitySchema;

          // existing code...

          // Apply history plugin once if schema name matches TRACKABLES config
          // Pass both schema and configService to applyHistoryPluginOnce
          applyHistoryPluginOnce(schema, configService);

          return schema;
        },
      },
    ]),
  ],
  controllers: [YourEntityController],
  providers: [YourEntityService],
  exports: [YourEntityService],
})
export class YourEntityModule {}
```

### 2. Configuration Setup

#### Environment Variables

Add your entity to the `TRACKABLES` environment variable in `.env`:

```bash
TRACKABLES=Dataset,Proposal,Sample,Instrument,PublishedData,Policy,Datablock,Attachment,YourEntity
```

#### Configuration File

Add history access groups to `src/config/configuration.ts`:

```typescript
// Add environment variable extraction
const historyYourEntityGroups = process.env.HISTORY_ACCESS_YOUR_ENTITY_GROUPS || "";

// Add to accessGroups section
accessGroups: {
  // ... existing groups

  //History
  historyYourEntity: historyYourEntityGroups
    ? historyYourEntityGroups.split(",").map((v) => v.trim())
    : [],
}
```

#### Environment Variable Definition

Add to your environment configuration:

```bash
HISTORY_ACCESS_YOUR_ENTITY_GROUPS=yourEntityHistoryGroup,anotherGroup
```

### 3. CASL Authorization Configuration

Update `src/casl/action.enum.ts` to add a new action for your entity:

```typescript
export enum Action {
  // ... existing actions

  // History actions
  HistoryReadEndpoint = "history_read_endpoint",
  // ... existing history read actions
  HistoryReadYourEntity = "history_read_yourentity",
}
```

Update both authorization functions in `src/casl/casl-ability.factory.ts`:

```typescript
// 1. Update endpoint-level access
historyEndpointAccess(user: JWTUser) {
  const { can, build } = new AbilityBuilder(
    createMongoAbility<PossibleAbilities, Conditions>,
  );

  if (user) {
    if (user.currentGroups && Array.isArray(user.currentGroups)) {
      // ... existing code

      // Users with access to your entity history also get endpoint access
      if (
        user.currentGroups.some((g) =>
          this.accessGroups?.historyYourEntity.includes(g),
        )
      ) {
        can(Action.HistoryReadEndpoint, "GenericHistory");
      }
    }
  }

  return build({
    detectSubjectType: (item) =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
}

// 2. Update instance-level access
historyInstanceAccess(user: JWTUser) {
  const { can, build } = new AbilityBuilder(
    createMongoAbility<PossibleAbilities, Conditions>,
  );

  if (user && user.currentGroups && Array.isArray(user.currentGroups)) {
    if (
      user.currentGroups.some((g) =>
        this.accessGroups?.admin.includes(g),
      )
    ) {
      // Admin gets access to all subsystems
      can(Action.HistoryReadYourEntity, "GenericHistory");
      // ... other existing permissions
    } else {
      // Specific permissions for your entity
      if (
        user.currentGroups.some((g) =>
          this.accessGroups?.historyYourEntity.includes(g),
        )
      ) {
        can(Action.HistoryReadYourEntity, "GenericHistory");
      }
    }
  }

  return build({
    detectSubjectType: (item) =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
}
```

### 4. Update the History Controller

Update the subsystem action map in the history controller:

```typescript
private readonly subsystemActionMap = {
  // ... existing mappings
  YourEntity: Action.HistoryReadYourEntity,
};
```

### 5. Service Implementation

Your service methods should properly handle metadata fields when performing updates:

```typescript
import { HistoryService } from "../history/history.service";
import { getCurrentUsername } from "../common/utils/request-context.util";

@Injectable()
export class YourEntityService {
  constructor(
    @InjectModel(YourEntity.name)
    private yourEntityModel: Model<YourEntityDocument>,
    private historyService: HistoryService, // Inject if needed for custom queries
  ) {}

  // The history plugin automatically handles tracking of create, update, delete operations
  // But you need to properly set updatedBy and updatedAt in your update methods:

  async update(id: string, updateDto: UpdateYourEntityDto) {
    const username = getCurrentUsername();

    return this.yourEntityModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateDto,
          updatedBy: username,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );
  }
}
```

## History Plugin Options

The history plugin accepts several configuration options:

```typescript
interface HistoryPluginOptions {
  historyModelName?: string; // Default: GenericHistory.name
  modelName?: string; // Required: Must match TRACKABLES
  getActiveUser?: () => string; // Function to get current user
  configService?: ConfigService; // For accessing environment variables
  trackableStrategy?: "delta" | "document"; // Default: "document"
  trackables?: string[]; // Override TRACKABLES config
}
```

### Tracking Strategies

1. **Document Strategy** (default): Stores complete before/after document states
2. **Delta Strategy**: Stores only changed fields with their before/after values

Configure via environment variable:

```bash
TRACKABLE_STRATEGY=delta  # or "document"
```

## History Data Structure

Each history record contains:

```typescript
{
  subsystem: string;        // Entity name (e.g., "YourEntity")
  documentId: string;       // The _id of the changed document
  before?: object;          // Document state before change
  after?: object;           // Document state after change (null for deletes)
  operation: "update" | "delete";
  timestamp: Date;          // Auto-generated
  user?: string;           // Username who made the change
}
```

## Testing

### Unit Tests

Test your history implementation:

```typescript
describe("YourEntity History", () => {
  it("should record history on update", async () => {
    const entity = await yourEntityService.create(testData);

    await yourEntityService.update(entity._id, { field: "newValue" });

    const history = await historyService.find({
      subsystem: "YourEntity",
      documentId: entity._id,
    });

    expect(history).toHaveLength(1);
    expect(history[0].operation).toBe("update");
    expect(history[0].before.field).toBe("oldValue");
    expect(history[0].after.field).toBe("newValue");
  });
});
```

### Integration Tests

Add tests similar to existing ones in `/test/` directory:

```javascript
describe("YourEntity History API", () => {
  it("should get history for entity", async () => {
    return request(appUrl)
      .get("/api/v3/history")
      .query({
        filter: JSON.stringify({
          subsystem: "YourEntity",
          documentId: entityId,
        }),
      })
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .then((res) => {
        res.body.should.have.property("items");
        res.body.items.should.be.an("array");
      });
  });
});
```

## Best Practices

1. **Model Name Consistency**: Ensure the `modelName` in the plugin matches the name in `TRACKABLES`
2. **Access Control**: Always implement proper CASL authorization for history access
3. **Testing**: Include both unit and integration tests for history functionality
4. **Performance**: Consider the volume of changes when choosing tracking strategy
5. **Documentation**: Update API documentation to include history endpoints

## Troubleshooting

### Common Issues

1. **History not recording**: Check that entity name is in `TRACKABLES` environment variable
2. **Permission denied**: Verify CASL configuration includes your entity
3. **Plugin not loading**: Ensure `ConfigService` is properly injected
4. **Missing user info**: Verify `getCurrentUsername()` is working correctly

### Debug Logging

Enable debug logging to troubleshoot:

```typescript
// The plugin logs when history tracking is enabled
console.log(`History tracking enabled for model: ${modelName}`);
```

## Migration Notes

When adding history to existing entities:

1. Existing records won't have history until first modification
2. Consider backfilling critical historical data if needed
3. Test thoroughly with existing data before deployment

## Related Files

- `/src/common/schemas/generic-history.schema.ts` - History data model
- `/src/common/mongoose/plugins/history.plugin.ts` - Core plugin implementation
- `/src/history/` - History service and controller
- `/src/casl/casl-ability.factory.ts` - Authorization configuration
- `/test/Datablock.js` - Example of history testing

This guide should provide everything needed to implement history tracking for new entities in the SciCat backend system.
