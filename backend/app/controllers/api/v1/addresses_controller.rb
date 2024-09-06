class API::V1::AddressesController < ApplicationController
  before_action :set_address, only: [:show, :update, :destroy]
  respond_to :json

  # GET /api/v1/addresses
  def index
    @addresses = Address.all
    render json: @addresses
  end

  # GET /api/v1/addresses/:id
  def show
    render json: @address
  end

  # POST /api/v1/addresses
  def create
    @address = Address.new(address_params)
    if @address.save
      render json: @address, status: :created
    else
      render json: { errors: @address.errors.full_messages }, status: :unprocessable_entity
      render json: @address.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/addresses/:id
  def update
    if @address.update(address_params)
      render json: @address
    else
      render json: @address.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/addresses/:id
  def destroy
    @address.destroy
    head :no_content
  end

  private

  def set_address
    @address = Address.find(params[:id])
  end

  def address_params
    params.require(:address).permit(:line1, :line2, :city, :country_id, :user_id)
  end
end