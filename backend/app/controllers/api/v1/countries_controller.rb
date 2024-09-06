class API::V1::CountriesController < ApplicationController
  before_action :set_country, only: [:show, :update, :destroy]
  respond_to :json

  # GET /api/v1/countries
  def index
    @countries = Country.all
    render json: @countries
  end

  # GET /api/v1/countries/:id
  def show
    render json: @country
  end

  # POST /api/v1/countries
  def create
    @country = Country.new(country_params)
    if @country.save
      render json: @country, status: :created
    else
      render json: { errors: @country.errors.full_messages }, status: :unprocessable_entity
      render json: @country.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/countries/:id
  def update
    if @country.update(country_params)
      render json: @country
    else
      render json: @country.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/countries/:id
  def destroy
    @country.destroy
    head :no_content
  end

  private

  def set_country
    @country = Country.find(params[:id])
  end

  def country_params
    params.require(:country).permit(:name)
  end
end