class AddPushTokenToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :push_token, :string
  end
end