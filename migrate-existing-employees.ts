import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration to set all existing employees to INVESTOR type...');

  try {
    // Update all existing employees that don't have a type set (or have an empty type)
    // Since the database column now has a default, this might not find any records
    // but we'll check for records that might have been created before the schema change
    const result = await prisma.employee.updateMany({
      where: {
        // Find records where type is not set to any valid value
        // Since the field has a default, this might not catch anything
      },
      data: {
        type: 'INVESTOR',
      },
    });

    console.log(`Successfully updated ${result.count} employees to INVESTOR type.`);
    
    // As an extra safety measure, find all employees and ensure they have the correct type
    const allEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      }
    });
    
    let updateCount = 0;
    for (const employee of allEmployees) {
      // If the employee doesn't have a type set (shouldn't happen with the default, but just in case)
      if (!employee.type) {
        await prisma.employee.update({
          where: { id: employee.id },
          data: { type: 'INVESTOR' }
        });
        console.log(`Updated employee ${employee.name} (ID: ${employee.id}) to INVESTOR type.`);
        updateCount++;
      }
    }
    
    console.log(`Updated ${updateCount} additional employees to INVESTOR type.`);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Migration script completed'))
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });