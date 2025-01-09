"""Add ContactMedia association table

Revision ID: c26ba75f35ae
Revises: 6b682ce119da
Create Date: 2025-01-09 00:13:57.635740

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c26ba75f35ae'
down_revision = '6b682ce119da'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('contact_media',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('contact_id', sa.Integer(), nullable=False),
    sa.Column('media_file_id', sa.Integer(), nullable=False),
    sa.Column('role', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['contact_id'], ['contacts.id'], name=op.f('fk_contact_media_contact_id_contacts')),
    sa.ForeignKeyConstraint(['media_file_id'], ['media_files.id'], name=op.f('fk_contact_media_media_file_id_media_files')),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('contact_media')
    # ### end Alembic commands ###
