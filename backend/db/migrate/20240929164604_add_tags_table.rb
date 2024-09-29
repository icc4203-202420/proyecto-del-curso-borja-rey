class AddTagsTable < ActiveRecord::Migration[7.1]
  def change
    create_table :tags do |t|
      t.references :event_picture, null: false, foreign_key: true
      t.references :tagged_user, null: false, foreign_key: { to_table: :users }
      t.references :tagged_by, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
