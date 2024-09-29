class API::V1::UsersController < ApplicationController
  respond_to :json
  before_action :set_user, only: [:show, :update, :friendships, :create_friendship]

  def index
    @users = User.includes(:reviews, :address).all
    render json: @users, status: :ok
  end

  def show
    render json: @user, status: :ok
  end

  def create
    @user = User.new(user_params)
    if @user.save
      render json: @user.id, status: :ok
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def update
    #byebug
    if @user.update(user_params)
      render :show, status: :ok, location: api_v1_users_path(@user)
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def friendships
    @friendships = @user.friendships.includes(:friend)
    friends = @friendships.map(&:friend)
    render json: friends, status: :ok
  end

  def create_friendship
    friendship_values = params.require(:friendship).permit(:user_id, :friend_id, :event_id)
    puts "friendship_values: #{friendship_values}"
    
    event_id = friendship_values[:event_id].to_i == 0 ? nil : friendship_values[:event_id]
  
    if friendship_values[:user_id].to_i != @user.id
      @friendship = Friendship.new(user_id: friendship_values[:user_id], friend_id: friendship_values[:friend_id], event_id: event_id)
      
      if @friendship.save
        render json: @friendship, status: :ok
      else
        puts @friendship.errors.full_messages
        render json: @friendship.errors, status: :unprocessable_entity
      end
    else
      render json: { error: 'No puedes añadirte a ti mismo como amigo' }, status: :unprocessable_entity
    end
  end

  def is_friend
    friendship_values = params.require(:friendship).permit(:user_id, :friend_id)
    @friendship = Friendship.where(user_id: friendship_values[:user_id], friend_id: friendship_values[:friend_id]).first
    puts "is_friend_values!!!!!!!!!!!!!!!!!!!!!!!!!!!!!: #{friendship_values}"
    puts "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!friendship: #{@friendship}"
    if @friendship.present?
      render json: { is_friend: true }, status: :ok
    else
      render json: { is_friend: false }, status: :ok
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.fetch(:user, {}).
        permit(:id, :first_name, :last_name, :email, :age, :handle,
            { address_attributes: [:id, :line1, :line2, :city, :country, :country_id, 
              country_attributes: [:id, :name]],
              reviews_attributes: [:id, :text, :rating, :beer_id, :_destroy]
            })
  end
end
