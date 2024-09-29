class ReplaceBarWithEventInFriendships < ActiveRecord::Migration[7.1]
  def change
    remove_reference :friendships, :bar, foreign_key: true
    add_reference :friendships, :event, null: true, foreign_key: true
  end
end